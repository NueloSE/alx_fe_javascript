"use strict";

const quotes = JSON.parse(localStorage.getItem("quotes") || "[]");
const showQuoteBtn = document.getElementById("newQuote");
const displayContainer = document.getElementById("quote");
const downloadLink = document.querySelector("a");
const categoryFilter = document.getElementById("categoryFilter");
let previousQuoteIndex = 0;
let uniqueCategories = [];
let categoryAddedIndex = 0;

populateCategories();
categoryFilter.value = localStorage.getItem("selectedCategory");

function filterQuotes(entireArray = quotes) {
  let selectedCategory = categoryFilter.value;

  if (selectedCategory === "all") {
    localStorage.setItem("selectedCategory", categoryFilter.value);
    return entireArray;
  }
  let modifiedArray = [];
  entireArray.forEach((item) => {
    if (item["category"] === selectedCategory) {
      modifiedArray.push(item);
    }
  });

  localStorage.setItem("selectedCategory", categoryFilter.value);

  return modifiedArray;
}

function populateCategories() {
  quotes.forEach((quote) => {
    let category = quote["category"];

    if (uniqueCategories.indexOf(category) === -1) {
      uniqueCategories.push(category);
    }
  });

  if (categoryAddedIndex === 0) {
    uniqueCategories.forEach((category) => {
      let categoryOption = document.createElement("option");
      categoryOption.value = category;
      categoryOption.textContent = category;
      categoryFilter.appendChild(categoryOption);
    });
    categoryAddedIndex = uniqueCategories.length;
  } else {
    for (let i = categoryAddedIndex; i < uniqueCategories.length; i++) {
      let category = uniqueCategories[i];
      let categoryOption = document.createElement("option");
      categoryOption.value = category;
      categoryOption.textContent = category;
      categoryFilter.appendChild(categoryOption);
      categoryAddedIndex += 1;
    }
  }
}

function copyQuote() {
  const currentQuote = displayContainer.textContent;
  if (!currentQuote) {
    alert("Empty quote! Nothing to copy!");
    return;
  }

  navigator.clipboard
    .writeText(currentQuote)
    .then(() => {
      console.log("copied to clipboard");
      let p = document.createElement("p");
      p.classList.add('copy');
      p.textContent = "copied";
      displayContainer.appendChild(p);
      setTimeout(() => {
        p.remove();
      }, 1500);
    })
    .catch((err) => {
      console.error("error copy to clipboard" + err);
    });
}

function showRandomQuote() {
  let newQuotes = filterQuotes(quotes);
  const numberOfQuotes = newQuotes.length - 1;
  let currentQuoteIndex;

  if (numberOfQuotes === 0) {
    currentQuoteIndex = 0;
  } else {
    do {
      currentQuoteIndex = Math.round(Math.random() * numberOfQuotes);
    } while (previousQuoteIndex === currentQuoteIndex);
  }
  previousQuoteIndex = currentQuoteIndex;

  const quoteToDisplay = newQuotes[currentQuoteIndex];

  displayContainer.classList.add('quoteDisplay');
  displayContainer.classList.add('flex-items');

  displayContainer.innerHTML = quoteToDisplay.text;
}

function addQuote() {
  const quote = document.getElementById("newQuoteText").value;
  let category = document.getElementById("newQuoteCategory").value;

  if (quote && category) {
    const newQuote = {};
    if (!checkQuoteExist(quote, category)) {
      newQuote["text"] = quote;
      newQuote["category"] = category;
      quotes.push(newQuote);
      populateCategories();
      saveQuotes();
    }
  }
}

function checkQuoteExist(text, category) {
  return (
    quotes.some((quote) => quote.text === text) &&
    quotes.some((quote) => quote.category === category)
  );
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

function downloadQuote() {
  const userQuote = displayContainer.textContent || "";
  downloadLink.download = "quote.text";
  let blob = new Blob([userQuote], { type: "text/plain" });
  downloadLink.href = URL.createObjectURL(blob);
}

function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) {
    console.error("file not loaded");
    return;
  }
  let fileReader = new FileReader();
  fileReader.onload = function (event) {
    try {
      const loadedQuotes = [];
      let importedQuotes = JSON.parse(event.target.result);
      loadedQuotes.push(...importedQuotes);

      loadedQuotes.forEach((loadQuote) => {
        const text = loadQuote.text;
        const category = loadQuote.category;
        if (!checkQuoteExist(text, category)) {
          quotes.push(loadQuote);
        }
      });
      saveQuotes();
      populateCategories();
    } catch (error) {
      console.error("Error json parsing: ", error);
    }
  };
  fileReader.readAsText(file);
}

showQuoteBtn.addEventListener("click", showRandomQuote);
