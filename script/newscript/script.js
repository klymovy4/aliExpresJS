document.addEventListener("DOMContentLoaded", () => {

    const search = document.querySelector(".search"),
        cartBtn = document.querySelector("#cart"),
        wishlistBtn = document.querySelector("#wishlist"),
        goodsWrapper = document.querySelector(".goods-wrapper"),
        cart = document.querySelector(".cart"),
        category = document.querySelector(".category"),
        cardCounter = cartBtn.querySelector(".counter"),
        wishlistCounter = wishlistBtn.querySelector(".counter"),
        cartWrapper = document.querySelector(".cart-wrapper");
    // куки
    const cookieQuery = get => {
        if (get) {
            if (getCookie("goodsBasket")) {
                // goodsBasket = JSON.parse(getCookie("goodsBasket"));
                Object.assign(goodsBasket, JSON.parse(getCookie("goodsBasket")))

            }
            checkCount();
        } else {
            document.cookie = `goodsBasket = ${JSON.stringify(goodsBasket)}; max-age = 86400e3`;
        };
    };

    const wishlist = [];
    let goodsBasket = {};

    const loading = (nameFunction) => {
        const spinner = `
        <div id="spinner"><div class="spinner-loading"><div><div><div></div>
        </div><div><div></div></div><div><div></div></div><div><div></div></div></div></div></div>
        `;

        console.log(nameFunction);
        if (nameFunction === "renderCard") {
            goodsWrapper.innerHTML = spinner;
        }
        if (nameFunction === "renderBasket")
            cartWrapper.innerHTML = spinner;
    };
    // Создаем Карточки товаров и корзину товаров
    const createCardGoods = (id, title, price, img) => {
        const card = document.createElement("div");
        card.className = "card-wrapper col-12 col-md-6 col-lg-4 col-xl-3 pb-3";
        card.innerHTML = `
                        <div class="card">
                            <div class="card-img-wrapper">
                                <img class="card-img-top" src="${img}" alt="">
                                <button class="card-add-wishlist ${wishlist.includes(id) ? "active" : ''}" data-goods-id = "${id}"></button>
                            </div>
                            <div class="card-body justify-content-between">
                                <a href="#" class="card-title">${title}</a>
                                <div class="card-price">${price} ₽</div>
                                <div>
                                    <button class="card-add-cart" data-goods-id = "${id}">Добавить в корзину</button>
                                </div>
                            </div>
                        </div>
                        `;
        return card;
    };
    const createCartGoods = (id, title, price, img) => {
        const card = document.createElement("div");
        card.className = "goods";
        card.innerHTML = `
                    <div class="goods-img-wrapper">
                            <img class="goods-img" src="${img}" alt="">

                        </div>
                        <div class="goods-description">
                            <h2 class="goods-title">${title}</h2>
                            <p class="goods-price">${price} ₽</p>

                        </div>
                        <div class="goods-price-count">
                            <div class="goods-trigger">
                                <button 
                                    class="goods-add-wishlist ${wishlist.includes(id) ? "active" : ''}"" 
                                    data-goods-id = "${id}"></button>
                                <button class="goods-delete" data-goods-id = "${id}"></button>
                            </div>
                        <div class="goods-count">${goodsBasket[id]}</div>
                    </div>
                    `;
        return card;
    };
    // Конец Создаем Карточки товаров и корзину товаров

    // рендер карзины и рендер основной
    const renderCard = items => {
        goodsWrapper.textContent = "";
        if (items.length) {
            items.forEach(({ id, title, price, imgMin }, index, array) => {
                goodsWrapper.append(createCardGoods(id, title, price, imgMin));
            });
        } else {
            goodsWrapper.textContent = " 👎 sorry try again!";
        }
        storageQuery();
        checkCount();
    };
    const renderBasket = items => {
        cartWrapper.textContent = "";
        if (items.length) {
            items.forEach(({ id, title, price, imgMin }, index, array) => {
                cartWrapper.append(createCartGoods(id, title, price, imgMin));
            });
        } else {
            cartWrapper.innerHTML = " 👎 Ваша корзина пока пуста!";
        }
        storageQuery();
        checkCount();
        console.log("renderBasket", items.id);
    };
    //  КОНЕЦ рендер карзины и рендер основной
    // Работа с хранилищем
    const getCookie = (name) => {
        let matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    };


    const closeCart = event => {
        const target = event.target;
        if (target === cart ||
            target.classList.contains("cart-close") ||
            event.keyCode === 27) {
            cart.style.display = "";
            document.removeEventListener("keyup", closeCart)
        }
    };
    const openCart = event => {
        event.preventDefault();
        cart.style.display = "flex";
        document.addEventListener("keyup", closeCart);
        getGoods(renderBasket, showCartBasket);
    };

    const calcTotalPrice = goods => {
        //////////////////////
        // let sum = 0;
        // for (const item of goods) {
        //     sum += item.price * goodsBasket[item.id];

        // }
        /////////////////////////////////////////////
        // reduce FOR

        let sum = goods.reduce((accum, item) => {
            return accum + item.price * goodsBasket[item.id];
        }, 0);
        cart.querySelector(".cart-total>span").innerHTML = sum.toFixed(2);
    };

    // Фильтры
    const showCartBasket = items => {
        const basketGoods = items.filter(el => goodsBasket.hasOwnProperty(el.id));
        calcTotalPrice(basketGoods);
        return basketGoods;
    };
    const randomSort = items => items.sort(() => Math.random() - 0.5);
    const showWishlist = () => {
        getGoods(renderCard, items => items.filter(el => wishlist.includes(el.id)));
    };
    // КОНЕЦ Фильтры

    // запрос на сервер
    const getGoods = (handler, filter) => {
        loading(handler.name);
        fetch("db/db.json")
            .then(response => response.json())
            .then(filter)
            .then(handler)
    };

    // const categoryFilter = goods => goods.filter(item => item.category.includes)
    const choiceCategory = event => {
        event.preventDefault();
        const target = event.target;
        console.log(target.dataset.category);

        if (target.classList.contains("category-item")) {
            const category = target.dataset.category;
            getGoods(renderCard, goods => goods.filter(item => item.category.includes(category)))
        }
    };

    const searchGoods = (event) => {
        event.preventDefault();
        const input = document.querySelector("#searchGoods");
        const inputValue = input.value.trim();
        console.log(inputValue);
        if (inputValue) {
            const searchString = new RegExp(inputValue, 'i');
            getGoods(renderCard, items => items.filter(item => searchString.test(item.title)
            ));
            input.value = "";
        } else {
            search.classList.add("errror");
            setTimeout(() => {
                search.classList.remove("error");
            }, 2000)
        };
    };

    const checkCount = () => {
        wishlistCounter.textContent = wishlist.length;
        cardCounter.textContent = Object.keys(goodsBasket).length;
    };

    const storageQuery = (get) => {
        if (get) {
            if (localStorage.getItem("wishlist")) {
                // wishlist.splice(1,0 , ...JSON.parse(localStorage.getItem("wishlist"))); // или это или то
                wishlist.push(...JSON.parse(localStorage.getItem("wishlist")))
                // JSON.parse(localStorage.getItem("wishlist")).map(el => wishlist.push(el));
            }
            checkCount();
        } else {
            localStorage.setItem("wishlist", JSON.stringify(wishlist));
        };
    };

    const toggleWishlist = (item) => {
        // debugger;
        const id = item.dataset.goodsId;
        if (wishlist.includes(id)) {
            wishlist.splice(wishlist.indexOf(id), 1);
            item.classList.remove("active");
        } else {
            wishlist.push(id);
            item.classList.add("active");
        }
        checkCount();
        storageQuery();
    };

    const addBasket = id => {
        if (goodsBasket[id]) {
            goodsBasket[id] += 1
        } else {
            goodsBasket[id] = 1
        };
        checkCount();
        cookieQuery();
        console.log(goodsBasket);

    };

    const handlerGoods = event => {
        const target = event.target;
        if (target.classList.contains("card-add-wishlist")) {
            // console.log(target);
            toggleWishlist(target);
        };
        if (target.classList.contains("card-add-cart")) {
            addBasket(target.dataset.goodsId);
            // console.log(target.dataset.goodsId);
        };
    };

    const removeGoods = id => {
        delete goodsBasket[id];
        checkCount();
        cookieQuery();
        getGoods(renderBasket, showCartBasket)
    };

    const handlerBascket = event => {
        const target = event.target;
        if (target.classList.contains("goods-add-wishlist")) {
            toggleWishlist(target);
        }
        if (target.classList.contains("goods-delete")) {
            removeGoods(target.dataset.goodsId);
        }
    };

  
{
    
    cartBtn.addEventListener("click", openCart);
    cart.addEventListener("click", closeCart);
    category.addEventListener("click", choiceCategory);
    search.addEventListener("submit", searchGoods);
    goodsWrapper.addEventListener("click", handlerGoods);
    cartWrapper.addEventListener("click", handlerBascket);

    wishlistBtn.addEventListener("click", showWishlist);
    getGoods(renderCard, randomSort);
    storageQuery(true);
    cookieQuery("get");
}










































































































});
