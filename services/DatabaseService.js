const debug = require('debug')('kairion-test-api:DatabaseService');
const low = require('lowdb');

const db = low('db.json', {
  writeOnChange: false,
});

db.defaults({ products: [] })
  .value();
db.write();

class DatabaseService {
  static importProducts(shopName, data) {
    debug(`Importing ${data.length} products to database...`);

    const products = db.get('products');

    const usedIds = {};
    DatabaseService.getProducts(shopName)
      .forEach(item => {
        usedIds[item.id] = true;
      });

    let i = 0;
    for (const item of data) {
      if (!usedIds[item.id]) {
        products.push(item).value();
        i++;
      }
    }

    db.write();
    debug(`${i} products successfully imported to database`);
  }

  static getShops() {
    debug('Finding all shops...');

    return db.get('products')
      .map(product => product.shopName)
      .uniq()
      .value();
  }

  static getProducts(shopName) {
    debug(`Finding all products for shop ${shopName}...`);

    return db.get('products')
      .filter({ shopName })
      .value();
  }

  static getProduct(shopName, id) {
    debug(`Finding products for shop ${shopName} with id ${id}...`);

    return db.get('products')
      .find({ shopName, id })
      .value();
  }
}

module.exports = DatabaseService;
