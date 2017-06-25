import { categoryToIMG } from '../parser/emojis';

window.removeNode = (text) => {
  window.store.dispatch({ type: 'REMOVE_NODE', data: text });
};

window.addNode = (text) => {
  window.store.dispatch({ type: 'ADD_NODE', data: {
    type: 'node',
    node: {
      text: `coba-${Math.floor(Math.random() * 100)}`,
      url: "",
      fx: null,
      fy: null,
    },
    source: {
      text: text,
    },
  }});
};

window.editNode = (text) => {
  window.store.dispatch({
    type: 'TOGGLE_EDITABLE',
  })
}

/*
 * Return the HTML representation of a node.
 * The node is an object that has text, url, and category attributes;
 * all of them optional.
 */
export default (node) => {
  const emoji = categoryToIMG(node.category);

  return `
    <a href="#">${node.text} ${emoji}</a>
    <a href="#" style="background-color: #fff" onclick="removeNode('${node.text}')">
      <span>❌</span>
    </a>
    <a href="#" style="background-color: #fff" onclick="editNode('${node.text}')">
      <span>✏️</span>
    </a>
    <a href="#" style="background-color: #fff" onclick="addNode('${node.text}')">
      <span style="">❎</span>
    </a>
  `;
};
