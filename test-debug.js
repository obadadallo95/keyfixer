const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><p>Hello world</p>');
const div = dom.window.document.createElement('div');
div.contentEditable = 'true';
dom.window.document.body.appendChild(div);
console.log('isContentEditable:', div.isContentEditable);
