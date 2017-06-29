import { createStore } from 'redux'
import reducer from '../reducers/AppReducer';

window.store = createStore(reducer);

window.store.subscribe(() => {
  console.log(window.store.getState());
})

export default window.store;
