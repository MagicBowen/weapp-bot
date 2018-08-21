const accessTocken = require('../utils/access-tocken');
const request = require('request');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger').logger('controller_qrcode');

function getQrCodeImageFromWechat(savePath, url, page, scene) {
    return new Promise( (resolve, reject) => {
        const file = fs.createWriteStream(savePath);
        file.on('finish', () => {
            file.close( ()=> {
                resolve();
            });
        });
        request({
            url: url,
            method: "POST",
            json: {
                scene: scene,
                is_hyaline: true,
                page : page
            }
        })
        .on('error', function(err) {
            logger.error('download qrcode from wechat error: ' + err)
            reject(err)
        })        
        .pipe(file);   
    });
}

async function getQrCodeImage(url, page, scene) {
    const targetQrcodeImageName = scene + '.png';
    const targetQrCodeImagePath = path.join('static/image', scene + '.png');

    if (!fs.existsSync(targetQrCodeImagePath)) {
        await getQrCodeImageFromWechat(targetQrCodeImagePath, url, page, scene);
    }
    return targetQrcodeImageName    
}

async function getQrCode(ctx) {
    try {
        const tocken = await accessTocken.getTocken();
        const url = 'https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=' + tocken;

        const image = await getQrCodeImage(url, ctx.query.page, ctx.query.scene)
        ctx.response.type = "application/json";
        ctx.response.body = {url : '/image?name=' + image};
        ctx.response.status = 200;
    } catch(err) {
        ctx.response.status = 404;
        logger.error('get qrcode failed: ' + err);
        logger.debug(err.stack);
    }
}

module.exports = {
    'GET /qrcode' : getQrCode
}