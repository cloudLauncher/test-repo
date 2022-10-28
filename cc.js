// Desliguei Dice Page:260



const origin = ""//"https://culturecrossover.eu";
let lang = "eng";
let appReady = false;

let gameNumber = 'game';
let player;

const pages = {
    "": "lang-page",
    "players": "player-page",
    "scores": "score-page",
    "materials": "materials-page",
    "404": "404-page",
    "fortune": "fortune-page",
    "dice": "dice-page",
    "trivia": "trivia-page",
    "culture": "culture-page"
}

const translate = {
    eng: {
        players: "Players",
        fortune: "Fortune",
        culture: "Culture",
        trivia: "Trivia"
    },
    pol: {
        players: "Osoby grające",
        fortune: "Losu",
        culture: "Kultury",
        trivia: "TCiekawostki"
    },
    ger: {
        players: "Spieler*innen",
        fortune: "Glück",
        culture: "Kultur",
        trivia: "TWissen"
    },
    ita: {
        players: "Giocatoris",
        fortune: "Fortuna",
        culture: "Cultura",
        trivia: "Curiosità"
    },
    por: {
        players: "Jogadores",
        fortune: "Sorte",
        culture: "Cultura",
        trivia: "Curiosidades"
    },
    gre: {
        players: "Παίχτες",
        fortune: "Τύχης",
        culture: "Πολιτισμού",
        trivia: "TΑσήμαντα πράγματα"
    },
    ukr: {
        players: "Pгравців",
        fortune: "Фортуна",
        culture: "Культура",
        trivia: "Дрібниці"
    }

}



Array.prototype.shuffle = function () {
    let input = this;
    for (let i = input.length - 1; i >= 0; i--) {
        let randomIndex = Math.floor(Math.random() * (i + 1));
        let itemAtIndex = input[randomIndex];
        input[randomIndex] = input[i];
        input[i] = itemAtIndex;
    }
    return input;
}

const navigate = async () => {
    let path = window.location.pathname.split('/').pop()
    let page = pages[path] || pages[404];
    let newPage = document.createElement(page)
    newPage.className = 'page';
    let current = document.querySelector('.page')
    current.disconnect();
    current.parentNode.replaceChild(newPage, current)
};

const clickHandle = event => {
    event.preventDefault();
    let { currentTarget, target } = event;
    currentTarget[target.dataset.event]?.(event)
    if (target.dataset.page) {
        window.history.pushState({}, "", `${origin}${target.dataset.page}`);
        navigate();
    }
};

window.onpopstate = navigate;

//const channel = new BroadcastChannel('loading')
//channel.onmessage = ({ data }) => data.status == 'loaded' ? appReady() : appFailed();


class baseElement extends HTMLElement {
    constructor() { super() }

    handleCLicks = clickHandle;

    render(selector) {
        let temp = document.querySelector(`[part = ${selector}]`).content.cloneNode(true);
        this.appendChild(temp);
        let slots = document.querySelectorAll(`[data-slot]`);
        for (let i of slots) { i.textContent = translate[lang][i.dataset.slot] }
    }

    unselect() {
        let nodes = document.querySelectorAll('.selected')
        for (let el of nodes) { el.classList.remove('selected') }

    }

    async disconnect() { this.removeEventListener('click', this.handleCLicks) }

    connectedCallback() { this.addEventListener('click', clickHandle); }

    back() { history.back() }

}


class langPage extends baseElement {
    constructor() { super() }

    async setLanguage(event) {
        lang = event.target.dataset.lang;
        //let ready = await navigator.serviceWorker.ready;
        navigator.serviceWorker.controller.postMessage({ type: 'LANGUAGE', msg: lang });

    }
    async refresh() {
        //let ready = await navigator.serviceWorker.ready;
        navigator.serviceWorker.controller.postMessage({ type: 'REFRESH', });
    }

    connectedCallback() { this.render('lang-page'); super.connectedCallback() }
}

class playerPage extends baseElement {
    constructor() { super() }

    plus() {
        let items = localStorage.getItem(gameNumber)
        let game = JSON.parse(items) || { players: [] }
        let inputs = document.querySelectorAll('input')
        for (let i = 0, len = inputs.length; i < len; i++) {
            if (inputs[i].value) game.players[i].name = inputs[i].value;
        }
        game.players.push({ name: undefined, badges: 0, visa: 0, ticket: 0 })
        localStorage.setItem(gameNumber, JSON.stringify(game))
        document.querySelector('[part = "temp-lit"]').diff();

    }

    minus({ target }) {
        player = undefined;
        let items = localStorage.getItem(gameNumber)
        let game = JSON.parse(items)
        let inputs = document.querySelectorAll('input')
        for (let i = 0, len = inputs.length; i < len; i++) {
            if (inputs[i].value) game.players[i].name = inputs[i].value;
        }
        game.players.splice(target.dataset.index, 1);
        localStorage.setItem(gameNumber, JSON.stringify(game))
        document.querySelector('[part = "temp-lit"]').diff()

    }

    start() {
        let items = localStorage.getItem(gameNumber)
        let game = JSON.parse(items)
        let inputs = document.querySelectorAll('input')
        for (let i = 0, len = inputs.length; i < len; i++) {
            if (inputs[i].value) game.players[i].name = inputs[i].value;
            else game.players[i].name = `P${i + 1}`

        }
        localStorage.setItem(gameNumber, JSON.stringify(game))
    }
    connectedCallback() { this.render('player-page'); super.connectedCallback() }
}


class scorePage extends baseElement {
    constructor() { super() }
    select({ target }) {
        document.querySelectorAll('.selected').forEach(x => x.classList.remove('selected'))
        target.className = 'selected'
        player = target.dataset.prop;
    }
    plus() {
        let element;
        if (player == undefined) { element = document.querySelector(".selected"); if (!element) return; player = element.dataset.prop }
        else element = document.querySelector(`[data-prop = "${player}"]`)
        let value = parseInt(element.value) + 1;
        element.value = value;
        let items = localStorage.getItem(gameNumber)
        let game = JSON.parse(items)
        let [i, type] = player.split('-');
        game.players[i][type] = value;
        localStorage.setItem(gameNumber, JSON.stringify(game))
        document.querySelector('[part = "temp-lit"]').diff()
    }
    minus() {
        let element;
        if (player == undefined) { element = document.querySelector(".selected"); if (!element) return; player = element.dataset.prop }
        else element = document.querySelector(`[data-prop = "${player}"]`)
        let value = parseInt(element.value) - 1;
        if (value < 0) return
        element.value = value;
        let items = localStorage.getItem(gameNumber)
        let game = JSON.parse(items)
        let [i, type] = player.split('-');
        game.players[i][type] = value;
        localStorage.setItem(gameNumber, JSON.stringify(game))
        document.querySelector('[part = "temp-lit"]').diff()
    }

    connectedCallback() { this.render('score-page'); super.connectedCallback() }
}


class errorPage extends baseElement {
    constructor() { super() }


}

class triviaPage extends baseElement {
    constructor() { super() }

    lang({ target }) {
        let node = document.createElement('trivia-card')
        node.dataset.url = `https://app.culturecrossover.eu/wp-json/crossover/${lang}/trivia-cards/${target.dataset.country}`
        node.dataset.clang = `${target.dataset.country}`
        node.className = 'center'
        target.parentNode.replaceWith(node)
    }

    select({ target }) {
        if (target.dataset.val === "correct") {
            target.style.backgroundColor = "green"
            target.style.color = "#fff"
        }
        else { target.style.backgroundColor = "red" }
    }
    connectedCallback() { this.render('trivia-page'); super.connectedCallback() }
}

class fortunePage extends baseElement {
    constructor() { super() }

    select() {

    }
    connectedCallback() { this.render('fortune-page'); super.connectedCallback() }
}

class culturePage extends baseElement {
    constructor() { super() }

    lang({ target }) {
        let node = document.createElement('culture-card')
        node.dataset.url = `https://app.culturecrossover.eu/wp-json/crossover/${lang}/culture-cards/${target.dataset.country}`
        node.dataset.clang = `${target.dataset.country}`
        node.className = 'center'
        target.parentNode.replaceWith(node)
    }

    select({ target }) {
        if (target.dataset.val === "correct") {
            target.style.backgroundColor = "green"
            target.style.color = "#fff"
        }
        else { target.style.backgroundColor = "red" }
    }
    flip({ target }) {

        target.remove()
        let visible = document.querySelectorAll('.hide');
        visible.forEach(x => x.remove())
        console.log(visible)
        let hidden = document.querySelectorAll('.hidden')
        console.log(hidden)
        hidden.forEach(x => x.classList.remove('hidden'))
        console.log('hidden done')
    }
    connectedCallback() { this.render('culture-page'); super.connectedCallback() }
}

// Turned off to present as before while fixing the Dice page

class dicePage extends baseElement {
    constructor() { super() }
    roll() {

        const dadoImg = document.getElementById("img_dado");
        const audio_fx_01 = document.getElementById("audio_fx_01");
        const audio_fx_02 = document.getElementById("audio_fx_02");
        const audio_fx_03 = document.getElementById("audio_fx_03");
        const audio_fx = [audio_fx_01, audio_fx_02, audio_fx_03];

        let dadoNum = Math.ceil(Math.random() * 6);
        let audioNum = Math.floor(Math.random() * 3);
        if (dadoNum === 1 || dadoNum === 6) {
            dadoNum = 1;
        }
        else if (dadoNum === 3 || dadoNum === 5) {
            dadoNum = 2;
        }
        else if (dadoNum === 2 || dadoNum === 4) {
            dadoNum = 3;
        }
        audio_fx[audioNum].play();
        dadoImg.classList.toggle("rola");
        setTimeout(() => {
            dadoImg.classList.toggle("rola");
        }, 1000);

        setTimeout(() => {
            dadoImg.src = `https://app.culturecrossover.eu/dice/dice-${dadoNum}.jpg`;
        }, 200);
    }
    connectedCallback() { this.render('dice-page'); super.connectedCallback() }
}


customElements.define('base-element', baseElement)
//customElements.define('main-page', mainPage)
customElements.define('lang-page', langPage)
customElements.define('player-page', playerPage)
customElements.define('score-page', scorePage)


customElements.define('fortune-page', fortunePage)
customElements.define('dice-page', dicePage)
customElements.define('trivia-page', triviaPage)
customElements.define('culture-page', culturePage)
//customElements.define('404-page', errorPage)


// Number of cards

class slotElement extends HTMLElement {
    constructor() { super() }
    connectedCallback() { if (this.diff) this.diff() }

    setCards() {
        localStorage.setItem('cards', JSON.stringify({
            fortune: {},
            trivia: {},
            culture: {},
        }))
    }
}


class playerBoard extends slotElement {
    constructor() { super() }

    diff() {
        let find = localStorage.getItem(gameNumber);
        let get = JSON.parse(find) || { players: [] }
        let players = get.players;
        let frag = document.createElement('template')
        let str = "";
        for (let i = 0, len = players.length; i < len; i++) {
            let p = players[i]
            str +=
                `<input type="text"  ${p.name ? `value = "${p.name}"` : `placeholder = "P${i + 1}"`}><svg data-event = "minus" class = 'svg-icon' class = 'svg-icon' data-index = ${i} fill="none" xmlns="http://www.w3.org/2000/svg" > <use href="#minus"/></svg>`
        };
        str += `<svg data-event="plus" class='svg-icon' class='svg-icon back' fill="none" xmlns="http://www.w3.org/2000/svg"><use href="#plus" /></svg>`
        frag.innerHTML = str;
        this.innerHTML = '';
        this.appendChild(frag.content)


    }
}

class scoreBoard extends slotElement {
    constructor() { super() }

    diff() {
        let get = JSON.parse(localStorage.getItem(gameNumber));
        let players = get.players;
        let frag = document.createElement('template')
        let str = "";
        for (let i = 0, len = players.length; i < len; i++) {
            let p = players[i];
            str +=
                `<score-row>
            <strong data-prop="0-name" >${p.name}</strong>
            <input readonly data-event='select' data-prop="${i}-badges" value = ${p.badges}></input>
            <input readonly data-event='select' data-prop="${i}-ticket" value = ${p.ticket}></input>
        </score-row>`
        };
        frag.innerHTML = str;
        this.innerHTML = '';
        this.appendChild(frag.content)
        let selected = document.querySelectorAll(`[data-prop = "${player}"]`).forEach(el => el.classList.add('selected'))
        let sel = document.querySelectorAll('.selected')
        if (sel.length == 0) {
            let inputs = document.querySelectorAll('input');
            if (inputs.length > 0) inputs[0].classList.add('selected');

        }

    }
}


class triviaCard extends slotElement {
    constructor() { super() }
    async diff() {
        let url = this.dataset.url
        let clang = this.dataset.clang;
        console.log(clang)
        let get = localStorage.getItem('cards')
        if (get == undefined) { await super.setCards(); get = localStorage.getItem('cards') }
        let cards = JSON.parse(get);
        let find = await fetch(url)
        if (!find.ok) return alert('network connection error')
        let parsed = await find.json();
        if (!cards.trivia[clang] || cards.trivia[clang].length !== parsed.length) cards.trivia[clang] = { deck: [...Array(parsed.length).keys()].shuffle(), iter: 0 }
        let iter = cards.trivia[clang].iter;
        let deck = cards.trivia[clang].deck;
        console.log(deck)
        if (iter >= deck.length) { iter = 0; cards.trivia[clang].iter = 0; cards.trivia[clang].deck = [...Array(deck.length).keys()].shuffle(); }
        let trivia = parsed[deck[iter]]
        let frag = document.createElement('template')

        let str =
            `${trivia.question}
        <br>
        <button data-event = "select" data-val = ${trivia.correct == "A" ? "correct" : "incorrect"}>${trivia.opt_a}</button
        <br>
        <button data-event = "select" data-val = ${trivia.correct == "B" ? "correct" : "incorrect"}>${trivia.opt_b}</button
        <br>
        <button data-event = "select" data-val = ${trivia.correct == "C" ? "correct" : "incorrect"}>${trivia.opt_c}</button`

        frag.innerHTML = str;
        this.innerHTML = '';
        this.appendChild(frag.content)
        let selected = document.querySelectorAll(`[data-prop = "${player}"]`).forEach(el => el.classList.add('selected'))
        cards.trivia.iter++;
        localStorage.setItem('cards', JSON.stringify(cards))
    }

}

class fortuneCard extends slotElement {
    constructor() { super() }

    async diff() {
        let get = localStorage.getItem('cards')
        if (get == undefined) { await super.setCards(); get = localStorage.getItem('cards') }
        let cards = JSON.parse(get);
        let find = await fetch(`https://app.culturecrossover.eu/wp-json/crossover/${lang}/fortune-cards`)
        if (!find.ok) return alert('network connection error')
        let parsed = await find.json();
        if (!cards.fortune[lang] || cards.fortune[lang].length !== parsed.length) cards.fortune[lang] = { deck: [...Array(parsed.length).keys()].shuffle(), iter: 0 }
        let iter = cards.fortune[lang].iter;
        let deck = cards.fortune[lang].deck;

        if (iter >= deck.length) { iter = 0; cards.fortune[lang].iter = 0; cards.fortune[lang].deck }
        let fortune = parsed[deck[iter]]

        let frag = document.createElement('template')
        let str = `${fortune.fortune}`
        frag.innerHTML = str;
        this.innerHTML = '';
        this.appendChild(frag.content)
        fortune.unlucky ? document.querySelector(".page").style.backgroundColor = "#e94e15" : document.querySelector(".page").style.backgroundColor = "#59ba9d"
        cards.fortune.iter++;
        localStorage.setItem('cards', JSON.stringify(cards))
    }
}

class cultureCard extends slotElement {
    constructor() { super() }
    async diff() {
        let url = this.dataset.url
        let clang = this.dataset.clang;
        console.log(clang)
        let get = localStorage.getItem('cards')
        if (get == undefined) { await super.setCards(); get = localStorage.getItem('cards') }
        let cards = JSON.parse(get);
        let find = await fetch(url)
        if (!find.ok) return alert('network connection error')
        let parsed = await find.json();
        if (!cards.culture[clang] || cards.culture[clang] !== parsed.length) cards.culture[clang] = { deck: [...Array(parsed.length).keys()].shuffle(), iter: 0 }

        let iter = cards.culture[clang].iter;
        let deck = cards.culture[clang].deck;
        console.log(deck)
        if (iter >= deck.length) { iter = 0; cards.culture[clang].iter = 0; cards.culture[clang].deck = [...Array(deck.length).keys()].shuffle(); }

        let culture = parsed[deck[iter]]

        let frag = document.createElement('template')

        let str =
            `<div class='hide culture-question'>${culture.question}</div>

            ${culture.opt_a ?
                `<div class = 'hide'>
                <button data-event = "select" data-val = ${culture.correct == "A" ? "correct" : "incorrect"}>${culture.opt_a}</button>
                <br>
                <button data-event = "select" data-val = ${culture.correct == "B" ? "correct" : "incorrect"}>${culture.opt_b}</button>
                <br>
                <button data-event = "select" data-val = ${culture.correct == "C" ? "correct" : "incorrect"}>${culture.opt_c}</button>
            </div>
                `
                : ``}
            <br>

			${culture.truth ?
                `<div class = 'hide'>
                <button data-event = "select" data-val = ${culture.truth == "true" ? "correct" : "incorrect"}>TRUE</button>
				<br>
				<button data-event = "select" data-val = ${culture.truth == "false" ? "correct" : "incorrect"}>FALSE</button>
				<br>
			</div>`
                : ``} 
            <br>

            ${culture.explain ?
                `<div class="culture-answer hidden">
				${culture.explain}
			</div>`
                : ``} 

            <svg class = 'center hide' data-event="flip" xmlns="http://www.w3.org/2000/svg" width="17.6mm" height="17.5mm" viewBox="0 0 50 49.7">
            <defs>
                <style>
                .cls-1 { fill: none; stroke: #59ba9d; stroke-miterlimit: 10; stroke-width: 5.51px;}
                .cls-2 { fill: #59ba9d; }
                </style>
            </defs>
            <g id="Layer_1" data-name="Layer 1">
                <g>
                <path class="cls-1" d="M19.9,43.4a18.3,18.3,0,0,1-4.8-2.5,16.8,16.8,0,1,1,20.1-27l.9.8"/>
                <polygon class="cls-2" points="43.3 7.8 27 19.6 41.1 21.8 43.3 7.8"/>
                </g>
            </g>
            </svg>`

        frag.innerHTML = str;
        this.innerHTML = '';
        this.appendChild(frag.content)
        let selected = document.querySelectorAll(`[data-prop = "${player}"]`).forEach(el => el.classList.add('selected'))
        cards.culture.iter++;
        localStorage.setItem('cards', JSON.stringify(cards))
    }

}

customElements.define("player-board", playerBoard)
customElements.define("score-board", scoreBoard)

customElements.define("trivia-card", triviaCard)
customElements.define("fortune-card", fortuneCard)
customElements.define("culture-card", cultureCard)
