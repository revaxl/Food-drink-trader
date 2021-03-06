/**
 * authors: - Wulv
 *          - Revingly
*/

"use strict";

class Mod {
    static modName = "Revingly-FoodDrink-Redux";
    static funcptr = HttpServer.onRespond["IMAGE"];

    static getImage(sessionID, req, resp, body) {
        const filepath = `${ModLoader.getModPath(Mod.modName)}res/`;

        if (req.url.includes("/avatar/FoodDrink")) {
            HttpServer.sendFile(resp, `${filepath}FoodDrink.jpg`);
            return;
        }

        Mod.funcptr(sessionID, req, resp, body);
    }
	


    static load() {
        Logger.info(`Loading: ${Mod.modName}`);

        const filepath = `${ModLoader.getModPath(Mod.modName)}db/`;

        DatabaseServer.tables.traders.FoodDrink = {
            "assort": Mod.createFoodAndDrinkAssortTable(),
            "base": JsonUtil.deserialize(VFS.readFile(`${filepath}base.json`))
        };

        let locales = DatabaseServer.tables.locales.global;

        for (const locale in locales) {
            locales[locale].trading.FoodDrink = {
                "FullName": "Food & Drink",
                "FirstName": "Food & Drink",
                "Nickname": "Food & Drink",
                "Location": "In the food shop",
                "Description": "Get your food and drink here!"
            };
        }

        DatabaseServer.tables.locales.global = locales;
    }

    static createFoodAndDrinkAssortTable() {
        const { original_prices } = require('./config.json');
        const FOOD_ID = "5448e8d04bdc2ddf718b4569";
        const WATER_ID = "5448e8d64bdc2dce718b4568";
        const FOOD_CONTAINER_ID = "5c093db286f7740a1b2617e3";
        const SELL_AMOUNT = 100;
        const ROUBLE_ID = "5449016a4bdc2d6f028b456f";
        const items = DatabaseServer.tables.templates.items;
        
        return Object
            .values(items)
            .filter(item => item._parent === FOOD_ID || item._parent === WATER_ID || item._id === FOOD_CONTAINER_ID)
            .map(item => {
                return {
                    "_id": HashUtil.generate(),
                    "_tpl": item._id,
                    "parentId": "hideout",
                    "slotId": "hideout",
                    "upd": {
                        "UnlimitedCount": true,
                        "StackObjectsCount": 999999999
                    }
                }
            })
            .reduce((acc, item) => {
                acc.items.push(item);
                acc.barter_scheme[item._id] = [
                    [
                        {
                            "count": original_prices ? items[item._tpl]._props.CreditsPrice : SELL_AMOUNT ,
                            "_tpl": ROUBLE_ID
                        }
                    ]
                ];
                acc.loyal_level_items[item._id] = 1;
                return acc;
            },
                {
                    items: [], barter_scheme: {}, loyal_level_items: {}
                }
            );
    }
}

module.exports.Mod = Mod;
