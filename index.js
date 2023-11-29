import van from 'vanjs-core';
import hanziDb from 'togscc/data/characters.json?raw';
import shuffle from 'lodash.shuffle';

const hanzi = JSON.parse(hanziDb);

class RandomPicker {
  constructor(chars, partSizes) {
    this._chars = chars;
    this._partSizes = structuredClone(partSizes);

    this.shuffle();
  }

  shuffle() {
    this._chars = shuffle(this._chars);
    this._partSizes = shuffle(this._partSizes);
  }

  *make() {
    let i = 0;
    let pos = 0;
    while (true) {
      const size = this._partSizes[i];
      console.log('size', size, 'pos', pos);
      yield this._chars.slice(pos, pos + size).join('');

      i++;
      pos = pos + size;
      if (i >= this._partSizes.length) {
        i = 0;
      }

      if (pos >= this._chars.length) {
        pos = 0;
      }
    }
  }
}

const partSizes = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const hanziPicker = new RandomPicker(hanzi, partSizes).make();
console.log(hanziPicker);

const commonSymbols = `，。？！“”`.split('');
const commonSymbolsPicker = new RandomPicker(commonSymbols, [1]).make();

const { div, input, label, button } = van.tags;

function idBuilder(label) {
  let i = 1;
  return () => `${label}_${i++}`;
}

const cmptId = idBuilder('cmpt');

function Checkbox({ name, value, onChange }) {
  const id = cmptId();
  const emit = e => {
    onChange(e.target.checked, e);
  };
  const checkbox = input({ type: 'checkbox', name: value, id, onchange: emit });
  checkbox.checked = value ?? false;
  return div({ class: 'checkbox' }, checkbox, label({ for: id }, name));
}

const letterFlags = [
  { name: 'hanzi', label: '汉字', enabled: true },
  { name: 'englishLetters', label: '英文字母', enabled: true },
  { name: 'numbers', label: '数字', enabled: true },
  { name: 'commonSymbols', label: '符号', enabled: true },
  { name: 'custom', label: '自定义', enabled: false },
];

function Options() {
  const checkboxs = letterFlags.map(it => Checkbox({ name: it.label, value: it.enabled, onChange: checked => (it.enabled = checked) }));

  const outputBox = div({ class: 'outputs' });
  const outputLength = div({ class: 'output-length' }, '输出长度：');

  const clickBuild = () => {
    let result = '';

    let textLen = result.length;
    while (textLen < 1000) {
      result += hanziPicker.next().value;
      result += commonSymbolsPicker.next().value;
      result += hanziPicker.next().value;
      textLen = result.length;
    }

    outputBox.textContent = result;
    outputLength.textContent = `输出长度：${textLen}`;
  };

  return div(
    { class: 'main' },
    div('随机汉字句子'),
    div({ class: 'checkboxs' }, ...checkboxs),
    div({ class: 'buttons' }, button({ onclick: clickBuild }, '生成')),
    outputBox,
    outputLength,
  );
}

van.add(document.getElementById('app'), Options());
