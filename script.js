const wrapper = document.querySelector(".wrapper");
const searchInput = wrapper.querySelector("input");
const synonyms = wrapper.querySelector(".synonyms .list");
const infoText = wrapper.querySelector(".info-text");
const volumeIcon = wrapper.querySelector(".word i");
let audio;

function data(result, word) {
    if (result.title) {
        infoText.innerHTML = `Can't find the meaning of <span>"${word}"</span>. Please try another word`;
        return;
    }

    wrapper.classList.add("active");

    let wordData = result[0];

    let definition = wordData.meanings[0].definitions[0];
    let phonetics = `${wordData.meanings[0].partOfSpeech} /${wordData.phonetics[0]?.text || ""}/`;

    document.querySelector(".word p").innerText = wordData.word;
    document.querySelector(".word span").innerText = phonetics;
    document.querySelector(".meaning span").innerText = definition.definition;

    // EXAMPLE FIX — cherche dans tous les meanings ET definitions
    let example = null;
    wordData.meanings.forEach(meaning => {
        meaning.definitions.forEach(def => {
            if (!example && def.example) example = def.example;
        });
    });
    document.querySelector(".example span").innerText = example || "No example available";

    // AUDIO FIX
    let audioUrl = wordData.phonetics.find(p => p.audio)?.audio;
    if (audioUrl) {
        audio = new Audio(audioUrl);
    }

    // SYNONYMS FIX — cherche dans tous les meanings ET definitions
    let syns = [];
    wordData.meanings.forEach(meaning => {
        if (meaning.synonyms) syns.push(...meaning.synonyms);
        meaning.definitions.forEach(def => {
            if (def.synonyms) syns.push(...def.synonyms);
        });
    });

    // Supprimer les doublons
    syns = [...new Set(syns)];

    if (syns.length === 0) {
        synonyms.parentElement.style.display = "none";
    } else {
        synonyms.parentElement.style.display = "block";
        synonyms.innerHTML = "";
        syns.slice(0, 5).forEach(syn => {
            let tag = `<span onclick="search('${syn}')">${syn}</span>`;
            synonyms.insertAdjacentHTML("beforeend", tag);
        });
    }
}

function search(word) {
    searchInput.value = word;
    fetchApi(word);
}

function fetchApi(word) {
    infoText.innerHTML = `Searching the meaning of <span>"${word}"</span>`;
    let url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
    fetch(url).then(res => res.json()).then(result => data(result, word));
}

searchInput.addEventListener("keyup", e => {
    if (e.key === "Enter" && e.target.value) {
        fetchApi(e.target.value);
    }
});

volumeIcon.addEventListener("click", () => {
    if (audio) {
        audio.play();
    }
});