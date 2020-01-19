document.addEventListener("DOMContentLoaded", function () {

    const cartBtn = document.querySelector("#cart");
    const search = document.querySelector(".search");
    const modalCart = document.querySelector(".cart");
    const cardWrapper = document.querySelector(".goods-wrapper");
    const category = document.querySelector(".category");
    const cardCounter = cartBtn.querySelector(".counter");
    const wishlistBtn = document.querySelector("#wishlist");
    const wishlistCounter = wishlistBtn.querySelector(".counter");

    const wishList = [];

    const createCardGoods = (id, img, price, title) => {
        const card = document.createElement("div")
        card.className = "card-wrapper col-12 col-md-6 col-lg-4 col-xl-3 pb-3";
        card.innerHTML = `
                        <div class="card">
                            <div class="card-img-wrapper">
                                <img class="card-img-top" src="${img}" alt="">
                                <button class="card-add-wishlist ${wishList.includes(id) ? " active" : ''}" 
                                    data-goods-id="${id}"></button>
                            </div>
                            <div class="card-body justify-content-between">
                                <a href="#" class="card-title">${title}</a>
                                <div class="card-price">${price} ₽</div>
                                <div>
                                    <button id=${id} class="card-add-cart" data-goods-id="${id}">Добавить в корзину</button>
                                </div>
                            </div>
                        </div>
                      `;
        return card;
    };
    const openCart = (event) => {
        event.preventDefault();
        modalCart.style.display = "flex";
        document.addEventListener("keyup", closeCart);
    };
    const closeCart = (event) => {
        const target = event.target.className;
        if (target === "cart" || target === "cart-close" || event.keyCode === 27) {
            modalCart.style.display = "";
            document.removeEventListener("keyup", closeCart);
        };
    };
    const getGoods = (handler, filter) => {
        loader();
        fetch("db/db.json")
            .then(response => response.json())
            .then(filter)
            .then(handler)
    };
    // Рендерим рендомом наш масив из db/db.json
    const randomSort = (items) => items.sort(() => Math.random() - 0.5);
    const renderCard = (items) => {
        cardWrapper.textContent = "";

        if (items.length) {
            items.forEach(({ id, imgMin, price, title }) => {
                cardWrapper.append(createCardGoods(id, imgMin, price, title));
            });
        } else {
            cardWrapper.textContent = "👎 Sorry, try again!";
        }
        // return items;

    };
    // END   Рендерим рендомом наш масив из db/db.json

    const choiceCategory = event => {
        event.preventDefault();
        const target = event.target.classList.contains("category-item");
        const categoryItems = event.target.dataset.category;
        if (target) {
            getGoods(renderCard, items => items.filter(el => el.category.includes(categoryItems)))
        }
    };

    const loader = () => {
        cardWrapper.innerHTML = `
                                <div id="spinner">
                                <div class="spinner-loading">
                                <div><div><div></div>
                                </div>
                                <div><div>
                                </div></div>
                                <div><div></div>
                                </div><div><div></div></div></div>
                                </div></div>

                                `
    };

    const serchGoods = (event) => {
        event.preventDefault();
        const input = event.target.elements.searchGoods;
        const inputValue = input.value.trim();
        if (inputValue !== "") {
            const searchString = new RegExp(inputValue, "i");
            getGoods(renderCard, items => items.filter(el => searchString.test(el.title)))
        } else {
            search.classList.add("error");
            setTimeout(() => {
                search.classList.remove("error");
            }, 2000)
        }
        input.value = "";
    };

    const checkCount = () => {
        wishlistCounter.textContent = wishList.length
    };

    const storageQuery = get => {
        if (get) {
            if (localStorage.getItem("wishlist")) {
                JSON.parse(localStorage.getItem("wishlist")).forEach(id => wishList.push(id));
            }
        } else {
            localStorage.setItem("wishlist", JSON.stringify(wishList));
        }
        checkCount();
      
    };

    const toggleWishList = (id, elem) => {
        // debugger;
        if (wishList.includes(id)) {  // индекс оф возвращает -1 если нет елемента в массиве. +1 = 0 тоесть фолс
            wishList.splice(wishList.indexOf(id), 1);
            elem.classList.remove("active");
        } else {
            wishList.push(id);
            elem.classList.add("active");
            console.log(wishList);
        };
        checkCount();
        storageQuery();
    };

    const handlerGoods = event => {
        const target = event.target;
        if (target.classList.contains("card-add-wishlist")) {
            // console.log(target.dataset.goodsId);
            // console.log(target);
            toggleWishList(target.dataset.goodsId, target);
        };
    };

    const showWishlist = () => {
        getGoods(renderCard, goods => goods.filter(el => wishList.includes(el.id)))
    };

    cartBtn.addEventListener("click", openCart);
    modalCart.addEventListener("click", closeCart);
    category.addEventListener("click", choiceCategory);
    search.addEventListener("submit", serchGoods);
    cardWrapper.addEventListener("click", handlerGoods);
    wishlistBtn.addEventListener("click", showWishlist)



    getGoods(renderCard, randomSort);
    storageQuery(true);


























})