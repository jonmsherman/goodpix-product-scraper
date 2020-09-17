const cheerio = require('cheerio');
const axios = require('axios');
const mongoose = require('mongoose');

const DirectSaleRetailer = require('../models/directSaleRetailer');
const Product = require('../models/product');
const ProductService = require('../services/productService');
const CloudinaryService = require('../services/cloudinaryService');
const AlgoliaService = require('../services/algoliaService');

const baseUrl = 'https://www.carlislecollection.com/collection/';
const brandName = 'Carlisle';

const parsePage = async (url) => {
    console.log(url);
    return new Promise((resolve, reject) => {
        axios(url)
            .then((response) => {
                const html = response.data;
                const $ = cheerio.load(html);

                const productUrls = [];
                // Parse all items on the page
                $('.collectionitem').each((i, item) => {
                    // Go to product page and parse
                    productUrls.push($(item).find('a').attr('href'));
                });

                // Go to next page
                const nextPageUrl = $('.btn ~ .nextprev a').attr('href');

                resolve({
                    productUrls: productUrls,
                    nextPageUrl: nextPageUrl,
                });
            })
            .catch((error) => reject(error));
    });
};

const parseProduct = async (url) => {
    return new Promise((resolve, reject) => {
        axios(url)
            .then((response) => {
                const html = response.data;
                const $ = cheerio.load(html);
                const id = $('#productdata #productnumber').text();
                const name = $('.infoblock .prodName').text();
                const desc = $('.infoblock p:last-child').text();
                let retailPrice = +$('.infoblock .prodPrice .saleprice')
                    .text()
                    .replace(/\$|\,/g, '');
                if (!retailPrice) {
                    retailPrice = +$('.infoblock .prodPrice')
                        .text()
                        .replace(/\$|\,/g, '');
                }
                const sizes = [];
                $('.inventory .box.green.cf').each((i, size) => {
                    sizes.push($(size).text());
                });
                const images = [];
                $('.imgthumb img').each((i, img) => {
                    images.push($(img).attr('src'));
                });

                if (images.length === 0) {
                    $('.imageZoomWpr img').each((i, img) => {
                        images.push($(img).attr('src'));
                    });
                }

                const details = [];
                $('.item.item-details li').each((i, detail) => {
                    details.push($(detail).text());
                });
                const categories = [];
                $('.breadcrumb a')
                    .slice(1)
                    .each((i, category) => {
                        categories.push($(category).text());
                    });

                // console.log({
                //     brand: brandName,
                //     name: name,
                //     category: categories,
                //     productId: id,
                //     productURL: url,
                //     description: details,
                //     images: images,
                //     sizes: sizes,
                //     retailPrice: retailPrice,
                //     directSaleRetailerInfo: {
                //         externalProductId: id,
                //     },
                //     isArchived: false,
                // });

                resolve({
                    brand: brandName,
                    name: name,
                    category: categories,
                    productId: id,
                    productURL: url,
                    description: details,
                    images: images,
                    sizes: sizes,
                    retailPrice: retailPrice,
                    directSaleRetailerInfo: {
                        externalProductId: id,
                    },
                    isArchived: false,
                });
            })
            .catch((error) => reject(error));
    });
};

const parsePages = async (url, totalProducts) => {
    const { productUrls, nextPageUrl } = await parsePage(url);
    const promises = [];
    for (let i = 0; i < productUrls.length; i++) {
        promises.push(parseProduct(productUrls[i]));
    }

    // Parse all products on the page
    await Promise.all(promises).then(async (products) => {
        console.log(`pulled ${products.length} from page`);
        totalProducts = totalProducts.concat(products);
    });

    // Go to next page
    if (nextPageUrl) {
        console.log('Page: ', nextPageUrl);
        totalProducts = await parsePages(nextPageUrl, totalProducts);
    }

    return totalProducts;
};

module.exports = {
    brandName,
    baseUrl,
    parsePages,
};
