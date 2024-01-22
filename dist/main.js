
import { bookList } from "./books.js";
import { stl } from './lessons.min.js';


const chapterIndex = {};



function display(content) {
    const main = document.querySelector('#main');
    main.innerHTML = '';
    if (Array.isArray(content)) {
        content.map(c => main.append(c));
    } else {
        main.append(content);
    }
}


function header(content) {
    const div = document.createElement('div');
    div.className = 'header';
    if (content) {
        div.append(content);
    }
    return div;
}


function back_button() {
    const b = document.createElement('button');
    b.className = 'back-button';
    b.innerHTML = '🞀';
    b.onclick = () => renderIndex();
    return b;
}


function top_bar(content) {
    const div = document.createElement('div');
    div.className = 'top-bar';
    if (content) {
        div.append(back_button());
        div.append(content);
    }
    return div;
}


function content_box() {
    const div = document.createElement('div');
    div.className = 'content';
    return div;
}


function sub(content) {
    const div = document.createElement('div');
    div.className = 'theme';
    if (content) {
        div.append(content);
    }
    return div;
}


function card(content) {
    const div = document.createElement('div');
    div.className = 'card';
    div.append(content);
    return div;
}


function lesson_box() {
    const b = document.createElement('div');
    b.className = 'lesson-box';
    return b;
}


function lesson(book, chapter) {
    const b = document.createElement('button');
    b.className = 'lesson';
    b.innerHTML = chapter;
    b.onclick = () => renderLesson(book, chapter);
    return b;
}


function removeSpaces(str) {
    return str.replace(/\s/g, '');
}


function removeDigits(str) {
    return str.replace(/\d+/g, '');
}


function renderIndex() {

    const content = [header('Study Guide')];
    for (const book in chapterIndex) {
        content.push(sub(book));
        const box = lesson_box();
        for (const chapter in chapterIndex[book]) {
            const l = lesson(book, `${chapter}`);
            box.append(l);
        }
        content.push(box);
    }
    display(content);

}


function renderLesson(book, chapter) {
    const lesson = chapterIndex[book][chapter];
    const h = top_bar(`${book} ${chapter}`);
    const box = content_box();
    const s = sub(`${lesson.theme}`);
    box.append(s);
    for (const note of lesson.notes) {
        const c = card(note);
        box.append(c);
    }
    display([h, box]);
}


function load() {
    addEventListener('DOMContentLoaded', () => {

        const books = [...bookList].map(x => x.toLocaleLowerCase()).map(x => removeSpaces(x));
        const plan = JSON.parse(stl);
        const keys = Object.keys(plan).sort((a, b) => {
            const x = removeDigits(removeSpaces(a.toLocaleLowerCase()));
            const y = removeDigits(removeSpaces(b.toLocaleLowerCase()));
            return books.indexOf(x) - books.indexOf(y);
        });
        for (const key of keys) {
            const [book, chapter] = key.split('/');
            if (!chapterIndex[book]) {
                chapterIndex[book] = {};
            }
            chapterIndex[book][chapter] = {...plan[key], book, chapter};
        }

        renderIndex();

    });
}


load();
