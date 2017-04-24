import { getKeyPairs } from '../reducers/shapesReducer';
import { Map } from 'immutable';

const testMap = Map({
    a: 1,
    b: 2,
    c: 3
});

const resultMap = getKeyPairs(testMap);
console.log(resultMap);