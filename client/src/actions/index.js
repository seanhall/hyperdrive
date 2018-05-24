import shop from '../api/shop'
import * as types from '../constants/ActionTypes'

const receiveProducts = products => ({
  type: types.RECEIVE_PRODUCTS,
  meta: {
    analytics: {
      type: 'page_view',
      payload: {
        'schema': '',
        'name': 'Catalog + Cart',
        'category': 'Shop',
        'url': window.location.href,
        'refr': document.referrer,
        'context': {
          'schema': ''
        }
      }
    }
  },
  products
})

export const getAllProducts = () => dispatch => {
  shop.getProducts(products => {
    dispatch(receiveProducts(products))
  })
}

const addToCartUnsafe = ( productId, product ) => ({
  type: types.ADD_TO_CART,
  meta: {
    analytics: {
      type: 'cart',
      payload: {
        'name': 'Add To Cart',
        'category': 'Shop',
        'url': window.location.href,
        'refr': document.referrer,
        'contexts': [{
          'schema': 'local/add_to_cart/jsonschema/1-0-0',
          'data': {
            'product_id': productId,
            'name': product.title,
            'category': product.category,
            'price': product.price,
            'quantity': 1
          }
        }]
      }
    }
  },
  productId
})

export const addToCart = productId => (dispatch, getState) => {
  if (getState().products.byId[productId].inventory > 0) {
    console.log(addToCartUnsafe(productId, getState().products.byId[productId]));
    dispatch(addToCartUnsafe(productId, getState().products.byId[productId]))
  }
}

export const checkout = products => (dispatch, getState) => {
  const { cart } = getState()

  dispatch({
    type: types.CHECKOUT_REQUEST
  })
  shop.buyProducts(products, () => {
    dispatch({
      type: types.CHECKOUT_SUCCESS,
      analytics: {
        type: 'transaction',
        payload: {
          'schema': '',
          'url': window.location.href,
          'refr': document.referrer,
          'context': {
            'schema': 'localhost/add_to_cart/jsonschema/1-0-0',
            'cart': cart
          }
        }
      },
      cart
    })
    // Replace the line above with line below to rollback on failure:
    // dispatch({ type: types.CHECKOUT_FAILURE, cart })
  })
}
