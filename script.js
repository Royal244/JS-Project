//
"use strict";

const form = document.getElementById("form");
const pictureContainer = document.querySelector(".pictures");
const searchControls = document.getElementById("searchControls");
const numberPages = document.querySelector(".numberPages");
const infoAboutLastPage = document.getElementById("store-numer-of-pages");
const lastPage = document.getElementById("last-page");
const firstPage = document.getElementById("first-page");
const nextPage = document.getElementById("next-page");
const prevPage = document.getElementById("previous-page");
const specificPage = document.getElementById("pageNumber");
const chosenNumber = document.getElementById("chosen-number");
const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");

const closeModal = function () {
  modal.classList.add("hidden");
  overlay.classList.add("hidden");
};

const openModalFunction = function () {
  modal.classList.remove("hidden");
  overlay.classList.remove("hidden");
};

const getCorrectString = (string) => {
  let trimedSearchString = string.trim();
  const pattern = / /g;
  return trimedSearchString.replace(pattern, "+");
};

const findDataFromApi = function (url) {
  return fetch(url)
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      return data.artObjects;
    });
};

const renderNoResold = function () {
  const html = `
      <article class="picture">
      <div class="picture__data">
        <h3 class="picture__author">No data found</h3>    
      </div>
    </article>
      `;
  pictureContainer.insertAdjacentHTML("beforeend", html);
  pictureContainer.style.opacity = 1;
};

const clearContent = function (elementID) {
  document.getElementById(elementID).innerHTML = "";
};

const renderCardComponent = function (data, index) {
  let infoAboutAuthor = "";

  if (data.principalOrFirstMaker === "") {
    infoAboutAuthor = "Author not found";
  } else {
    infoAboutAuthor = data.principalOrFirstMaker;
  }

  const html = `
  <article class="picture">
  <div class="picture__data">
  ${
    data.webImage
      ? `<img class="picture__img" id="picture-${index}" src="${data.webImage.url}" />`
      : `<p >Image not found</p>`
  }
  
    <h3 class="picture__author">${infoAboutAuthor}</h3>
    <h4 class="picture__date" id="text-${index}">${data.title}</h4>
    <button class="button__expand" id="button-${index}">See more</button>
  </div>
</article>
  `;

  pictureContainer.insertAdjacentHTML("beforeend", html);
  pictureContainer.style.opacity = 1;
  numberPages.style.opacity = 1;
  const expandButton = document.getElementById(`button-${index}`);
  const expandText = document.getElementById(`text-${index}`);
  expandButton.addEventListener("click", () => {
    expandText.textContent = data.longTitle;
    expandButton.style.visibility = "hidden";
  });

  if (data.webImage) {
    const picture = document.getElementById(`picture-${index}`);
    picture.addEventListener("click", () => {
      clearContent("modal");
      const html = `<button class="close-modal">&times;</button> <img class="img"  src="${data.webImage.url}" />`;
      modal.insertAdjacentHTML("afterbegin", html);
      const btnCloseModal = document.querySelector(".close-modal");
      openModalFunction();
      btnCloseModal.addEventListener("click", closeModal);
      overlay.addEventListener("click", closeModal);
    });
  }
};

const printPageNumber = (number) =>
  (infoAboutLastPage.textContent = `You are on page ${number} of ${sessionStorage.getItem(
    "numberOfPages"
  )} pages.`);

const generateFetchData = (url) => {
  findDataFromApi(url).then((data) => {
    if (!Array.isArray(data) || data.length === 0) {
      renderNoResold();
    } else {
      data.forEach((element, index) => {
        renderCardComponent(element, index);
      });
    }
  });
};

const findLastPage = (url) => {
  return fetch(url)
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      let numberOfPages = data.count / 5;
      let numberOfPagesRound = Math.round(numberOfPages);
      if (numberOfPages > numberOfPagesRound) {
        return numberOfPagesRound + 1;
      }
      return numberOfPagesRound;
    });
};

form.addEventListener("submit", (event) => {
  clearContent("picturesConteiner");
  const url = "https://www.rijksmuseum.nl/api/en/collection?key=MLxkKxmY";
  event.preventDefault();
  const data = new FormData(form);

  let queryString = "";

  const requestType = data.get("request-type");
  let searchString = data.get("search-string");
  if (requestType === "author") {
    searchString = getCorrectString(searchString);
    queryString = `&involvedMaker=${searchString}`;
  } else {
    searchString = getCorrectString(searchString);
    queryString = `&q=${searchString}`;
  }

  const correctURL = `${url}${queryString}&ps=5`;

  sessionStorage.setItem("url", correctURL);
  sessionStorage.setItem("pageNumber", "1");

  generateFetchData(`${correctURL}&p=1`);

  findLastPage(correctURL).then((data) => {
    sessionStorage.setItem("numberOfPages", data);
    if (data > 1) {
      printPageNumber(1);
      searchControls.style.visibility = "visible";
      const htmlNumber = `<input
      type="number"
      id="chosen-number"
      value=""
      name="search-page"
      min="1" max=${data} required />
      <button>Find this page</button>`;
      clearContent("pageNumber");
      specificPage.insertAdjacentHTML("afterbegin", htmlNumber);
    } else {
      searchControls.style.visibility = "hidden";
      printPageNumber(data);
      nextPage.style.pointerEvents = "auto";
    }
  });

  prevPage.style.pointerEvents = "none";
});

lastPage.addEventListener("click", () => {
  //
  clearContent("picturesConteiner");
  const url = sessionStorage.getItem("url");
  const lastPage = sessionStorage.getItem("numberOfPages");
  sessionStorage.setItem("pageNumber", lastPage);
  printPageNumber(lastPage);
  nextPage.style.pointerEvents = "none";
  prevPage.style.pointerEvents = "auto";
  generateFetchData(`${url}&p=${lastPage}`);
});

firstPage.addEventListener("click", () => {
  clearContent("picturesConteiner");
  const url = sessionStorage.getItem("url");
  sessionStorage.setItem("pageNumber", 1);
  printPageNumber(1);

  nextPage.style.pointerEvents = "auto";
  prevPage.style.pointerEvents = "none";

  generateFetchData(`${url}&p=1`);
});

nextPage.addEventListener("click", () => {
  clearContent("picturesConteiner");
  const url = sessionStorage.getItem("url");
  const nextNumber = Number(sessionStorage.getItem("pageNumber")) + 1;
  sessionStorage.setItem("pageNumber", nextNumber);
  printPageNumber(nextNumber);

  generateFetchData(`${url}&p=${nextNumber}`);

  if (nextNumber > 1) {
    prevPage.style.pointerEvents = "auto";
  }

  if (nextNumber === Number(sessionStorage.getItem("numberOfPages"))) {
    nextPage.style.pointerEvents = "none";
  }
});

prevPage.addEventListener("click", () => {
  clearContent("picturesConteiner");
  const url = sessionStorage.getItem("url");
  const prevNumber = Number(sessionStorage.getItem("pageNumber")) - 1;
  sessionStorage.setItem("pageNumber", prevNumber);
  printPageNumber(prevNumber);

  generateFetchData(`${url}&p=${prevNumber}`);

  if (prevNumber === 1) {
    prevPage.style.pointerEvents = "none";
  }

  if (Number(sessionStorage.getItem("pageNumber")) >= prevNumber) {
    nextPage.style.pointerEvents = "auto";
  }
});

specificPage.addEventListener("submit", (event) => {
  clearContent("picturesConteiner");
  event.preventDefault();
  const url = sessionStorage.getItem("url");
  const data = new FormData(specificPage);
  const number = data.get("search-page");
  sessionStorage.setItem("pageNumber", number);

  generateFetchData(`${url}&p=${number}`);

  printPageNumber(number);

  if (Number(number) === Number(sessionStorage.getItem("numberOfPages"))) {
    nextPage.style.pointerEvents = "none";
  }

  if (Number(number) === 1) {
    prevPage.style.pointerEvents = "none";
    nextPage.style.pointerEvents = "auto";
  } else {
    prevPage.style.pointerEvents = "auto";
  }
});
