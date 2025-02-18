// controller.js 👇
import * as model from './model.js';
import recipeView from './views/recipView.js';
import seachView from './views/searchView.js';
import resultView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookMarksView from './views/bookMarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
console.log('test top 20');

// if (module.hot)
// {
//   module.hot.accept();
// }

const controlRecipes = async function ()                                
{
    try
    {
        const id = window.location.hash.slice(1);
        if (!id) return;
        await recipeView.renderSpinner();

        // 0) Update result view to mark selected search result
        resultView.update(model.getSeachResultsPage());

        // 1) Update bookMarks View
        bookMarksView.update(model.state.bookMarks);

        // 2) loding recipe
        await model.loadRecipe(id);

        // 3) Rendering recipe
        await recipeView.render(model.state.recipe);


    }

    catch (err)
    {
        recipeView.renderError();
        console.error(err);
    }

}
controlRecipes();

const controlSearchResults = async function ()
{
    try
    {
        resultView.renderSpinner();

        // 1) Get search query
        const query = seachView.getQuery();
        if (!query) return;

        // 2) load search results
        await model.loadSearchResult(query);

        // 3) Render results
        resultView.render(model.getSeachResultsPage());

        // 4) Render initial pagination buttons 
        paginationView.render(model.state.search);

    } catch (err)
    {
        console.error(err);
    }
};

const controlPagination = function (goToPage)
{
    // 1) Render New results
    resultView.render(model.getSeachResultsPage(goToPage));

    // 4) Render New pagination buttons 
    paginationView.render(model.state.search);
};

const controlServings = function (newServings)
{
    // Update the recipe servings (in state)
    model.updateServings(newServings);

    // Update the recipe view 
    recipeView.update(model.state.recipe);
};



const controlAddBookMark = function ()
{
    //1) Add/Remove bookMark
    if (!model.state.recipe.bookMarkd)
        model.addBookMark(model.state.recipe);
    else
        model.deleteBookMark(model.state.recipe.id);
    //2) Update recipeView
    recipeView.update(model.state.recipe);
    //3) Render bookmarks
    bookMarksView.render(model.state.bookMarks);
};

const controlBookMarks = function ()
{
    bookMarksView.render(model.state.bookMarks);
};

const controlAddRecipe = async function (newRecipe)
{
    try
    {
        // upload the new recipe data 
        await model.uploadRecipe(newRecipe);
        console.log(model.state.recipe);
    } catch (err)
    {
        console.log('💥', err);
        addRecipeView.renderError(err.message);
    }
};

const init = function ()
{
    bookMarksView.addHendlerRener(controlBookMarks);
    recipeView.addHandlerRender(controlRecipes);
    recipeView.addHandlerUpdateServigs(controlServings);
    recipeView.addHandlerBookMark(controlAddBookMark);
    seachView.addHadlerSeach(controlSearchResults);
    paginationView.addHandlerClick(controlPagination);
    addRecipeView.addHendlerUpload(controlAddRecipe);
};
init();

// model.js 👇
import { acync } from 'regenerator-runtime';
import { API_URl, RES_PER_PAGE, KEY } from './config.js';
import { getJSON, sendJSON } from './helpers.js';
// import { indexOf } from 'core-js/core/array.js';

export const state = {
    recipe: {},
    search: {
        query: '',
        results: [],
        page: 1,
        resultsPerPage: RES_PER_PAGE,
    },
    bookMarks: [],
};
const createRecipeObject = function (data)
{
    const { recipe } = data.data;
    return {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        sourceUrl: recipe.source_url,
        img: recipe.image_url,
        servings: recipe.servings,
        cookingTime: recipe.cooking_time,
        ingredients: recipe.ingredients
    };
}
export const loadRecipe = async function (id)
{
    try
    {
        const data = await getJSON(`${API_URl}${id}`);
        state.recipe = createRecipeObject(data);

        // console.log(state.recipe);
        if (state.bookMarks.some(bookMark => bookMark.id === id))
            state.recipe.bookMarkd = true;
        else
            state.recipe.bookMarkd = false;
    }
    catch (err)
    {
        console.error(`${err} 💥💥💥`);
        throw err;
    }
};

export const loadSearchResult = async function (query)
{
    try
    {
        state.search.query = query
        const data = await getJSON(`${API_URl}?search=${query}`);
        // console.log(data);

        state.search.results = data.data.recipes.map(rec =>
        {
            return {
                id: rec.id,
                title: rec.title,
                publisher: rec.publisher,
                img: rec.image_url,
            }
        });
        state.search.page = 1;
    } catch (err)
    {
        console.error(`${err} 💥💥💥`);
        throw err;
    }
};

export const getSeachResultsPage = function (page = state.search.page)
{
    state.search.page = page;
    const start = (page - 1) * state.search.resultsPerPage;
    const end = page * state.search.resultsPerPage;
    return state.search.results.slice(start, end);
};

export const updateServings = function (newServings)
{
    state.recipe.ingredients.forEach(ing =>
    {
        ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
        // newQT = oldQt * newServings / oldServings // 2 * 8 / 4 = 4
    });
    state.recipe.servings = newServings;
};

const persisBookMarks = function ()
{
    localStorage.setItem('bookMarks', JSON.stringify(state.bookMarks))
};



export const addBookMark = function (recipe)
{
    // Add bookMark 
    state.bookMarks.push(recipe);
    // Mark current recipe as bookMark
    if (recipe.id === state.recipe.id) state.recipe.bookMarkd = true;
    persisBookMarks();
};


export const deleteBookMark = function (id)
{
    // Delete bookMark 
    const index = state.bookMarks.findIndex(el => el.id === id);
    state.bookMarks.splice(index, 1);

    // Mark current recipe as NOT bookMark
    if (id === state.recipe.id) state.recipe.bookMarkd = false;
    persisBookMarks();
};

const init = function ()
{
    const storage = localStorage.getItem('bookMarks');
    if (storage) state.bookMarks = JSON.parse(storage);
};

init();

const clearBookMarks = function ()
{
    localStorage.clear('bookMarks');
}

// clearBookMarks();


export const uploadRecipe = async function (newRecipe)
{
    try
    {
        // console.log(Object.entries(newRecipe));
        const ingredients = Object.entries(newRecipe)
            .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '').map(ing =>
            {
                const ingArr = ing[1].replaceAll(' ', '').split(',');
                if (ingArr.length !== 3) throw new Error('Wrong ingredient fromat! Please use the correct fromat :)');

                const [quantity, unit, decription] = ingArr;

                return { quantity: quantity ? +quantity : null, unit, decription };
            });

        const recipe = {
            title: newRecipe.title,
            sourceUrl: newRecipe.sourceUrl,
            img: newRecipe.image_url,
            publisher: newRecipe.publisher,
            cookingTime: +newRecipe.cooking_time,
            servings: +newRecipe.servings,
            ingredients,
        };


        const data = await sendJSON(`${API_URl}?key=${KEY}`, recipe);
        state.recipe = createRecipeObject(data);

    } catch (err)
    {
        throw err;
    }

};

//  helpers.js 👇
import { TIMOUT_SEC } from './config.js';
const timeout = function (s)
{
    return new Promise(function (_, reject)
    {
        setTimeout(function ()
        {
            reject(new Error(`Request took too long! Timeout after ${s} second`));
        }, s * 1000);
    });
};
export const getJSON = async function (url)
{
    try
    {
        fetchPro = fetch(url);
        const res = await Promise.race([fetchPro, timeout(TIMOUT_SEC)]);
        const data = await res.json();
        if (!res.ok) throw Error(`${data.message} (${res.status})`);
        return data;
    }

    catch (err)
    {
        throw err;
    }
};

export const sendJSON = async function (url, uploadData)
{
    try
    {
        fetchPro = fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(uploadData),
        });
        const res = await Promise.race([fetchPro, timeout(TIMOUT_SEC)]);
        const data = await res.json();
        if (!res.ok) throw Error(`${data.message} (${res.status})`);
        return data;
    }

    catch (err)
    {
        throw err;
    }
};

// addRecipeView.js 👇

import View from './view.js';
import icons from 'url:../../img/icons.svg';


class AddRecipeView extends View
{
    _parentElement = document.querySelector('.upload');
    _window = document.querySelector('.add-recipe-window');
    _overlay = document.querySelector('.overlay');
    _btnOpen = document.querySelector('.nav__btn--add-recipe');
    _btnClose = document.querySelector('.btn--close-modal');

    constructor()
    {
        super();
        this._addHendlerShowWindow();
        this._addHendlerHideWindow();
        this.addHendlerUpload();

    };

    toggelWindow()
    {
        this._overlay.classList.toggle('hidden');
        this._window.classList.toggle('hidden');
    };

    _addHendlerShowWindow()
    {
        this._btnOpen.addEventListener('click', this.toggelWindow.bind(this))
    };
    _addHendlerHideWindow()
    {
        this._btnClose.addEventListener('click', this.toggelWindow.bind(this))
        this._overlay.addEventListener('click', this.toggelWindow.bind(this))
    };

    addHendlerUpload(handler)
    {
        this._parentElement.addEventListener('submit', function (e)
        {
            e.preventDefault();
            const dataArr = [...new FormData(this)];
            const data = Object.fromEntries(dataArr);
            handler(data);
        });
    };

    _generateMarkup()
    {

    };
};

export default new AddRecipeView();