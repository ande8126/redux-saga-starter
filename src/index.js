import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App/App.jsx';
import registerServiceWorker from './registerServiceWorker';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
//// - needed for saga - ////
import createSagaMiddleware from 'redux-saga';
import logger from 'redux-logger';
//// needed to send/receive actions to saga ////
import { put, takeEvery } from 'redux-saga/effects';
//// -needed for saga axios calls- ////
import axios from 'axios';

const firstReducer = (state = 0, action) => {
    if (action.type === 'BUTTON_ONE') {
        console.log('firstReducer state', state);
        console.log('Button 1 was clicked!');
        return state + 1;
    }
    return state;
};

const secondReducer = (state = 100, action) => {
    if (action.type === 'BUTTON_TWO') {
        console.log('secondReducer state', state);
        console.log('Button 2 was clicked!');
        return state - 1;
    }
    return state;
};

const elementListReducer = (state = [], action) => {
    switch (action.type) {
        case 'SET_ELEMENTS':
            return action.payload;
        default:
            return state;
    }
};    

////- this is the saga that will watch for actions -////
//this is a generator function, uses yields
function* watcherSaga() {
    yield takeEvery( 'SET_ELEMENTS', firstSaga )
}

////- first saga -////
function* firstSaga( action ){
    console.log( 'in first saga:', action );
    //try axios call to server
    try{
        const response = yield axios.get( '/api/element' );
        //put
        yield put( {type: 'SET_ELEMENTS', payload: response.data } );
    }catch( err ){
        console.log( err );
    }
    // put (like a dispatch) to send to existing reducer

}

////- create our sagaMiddleware -////
const sagaMiddleware = createSagaMiddleware();

// This is creating the store
// the store is the big JavaScript Object that holds all of the information for our application
const storeInstance = createStore(
    // This function is our first reducer
    // reducer is a function that runs every time an action is dispatched
    combineReducers({
        firstReducer,
        secondReducer,
        elementListReducer,
    }),
    //// - sagaMiddleware is applied here, like logger - ////
    applyMiddleware(sagaMiddleware, logger),
);
//// - use the Watcher - ////
sagaMiddleware.run(watcherSaga);

ReactDOM.render(<Provider store={storeInstance}><App/></Provider>, document.getElementById('root'));
registerServiceWorker();
