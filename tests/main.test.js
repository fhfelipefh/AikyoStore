const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  renderCatalog,
  setProductSide,
  whatsappPhone
} = require('../main.js')

const catalog = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'catalog.json'), 'utf8'))

test('buildWhatsAppMessage includes product and category', () => {
  const message = buildWhatsAppMessage('KEROPPI [ 3,00 ]', 'Keroppi')

  assert.equal(
    message,
    'Olá! Quero comprar: KEROPPI [ 3,00 ]. Categoria: Keroppi. Você pode me passar disponibilidade, valor e forma de pagamento?'
  )
})

test('buildWhatsAppUrl uses the configured phone and encoded text', () => {
  const url = buildWhatsAppUrl('HELLO KITTY [ 2,00 ]', 'Hello Kitty')
  const expectedMessage = encodeURIComponent(buildWhatsAppMessage('HELLO KITTY [ 2,00 ]', 'Hello Kitty'))

  assert.equal(whatsappPhone, '555491106565')
  assert.equal(url, `https://wa.me/555491106565?text=${expectedMessage}`)
})

test('setProductSide swaps image source, alt text and pressed state', () => {
  const img = {
    src: 'front.jpeg',
    alt: 'Frente'
  }

  const buttons = [
    createSideButton('front', true),
    createSideButton('back', false)
  ]

  const card = {
    dataset: {
      frontSrc: 'front.jpeg',
      backSrc: 'back.jpeg',
      frontAlt: 'Frente do card',
      backAlt: 'Verso do card'
    },
    querySelector(selector) {
      return selector === '.product-media img' ? img : null
    },
    querySelectorAll(selector) {
      return selector === '.side-button' ? buttons : []
    }
  }

  assert.equal(setProductSide(card, 'back'), true)
  assert.equal(img.src, 'back.jpeg')
  assert.equal(img.alt, 'Verso do card')
  assert.equal(buttons[0].classList.has('active'), false)
  assert.equal(buttons[0].attributes['aria-pressed'], 'false')
  assert.equal(buttons[1].classList.has('active'), true)
  assert.equal(buttons[1].attributes['aria-pressed'], 'true')
})

test('setProductSide does not swap to back when card has no back image', () => {
  const img = {
    src: 'front.jpeg',
    alt: 'Frente'
  }

  const card = {
    dataset: {
      frontSrc: 'front.jpeg',
      backSrc: ''
    },
    querySelector(selector) {
      return selector === '.product-media img' ? img : null
    },
    querySelectorAll() {
      return []
    }
  }

  assert.equal(setProductSide(card, 'back'), false)
  assert.equal(img.src, 'front.jpeg')
})

test('only explicit FRENTE and VERSO product has side toggle', () => {
  const html = renderCatalog(catalog)
  const productCards = html.match(/class="card product-card"/g) || []
  const sideToggles = html.match(/side-toggle/g) || []
  const placeholders = html.match(/side-toggle-placeholder/g) || []
  const badtzOne = html.match(/data-product="BADTZ-MARU \[ 2,00 \]"/g) || []
  const badtzTwo = html.match(/data-product="BADTZ-MARU \[ 3,00 \]"/g) || []

  assert.equal(productCards.length, 6)
  assert.equal(sideToggles.length, 11)
  assert.equal(placeholders.length, 5)
  assert.equal(html.includes('KEROPI-1-FRENTE.jpeg'), true)
  assert.equal(html.includes('KEROPI-1-VERSO.jpeg'), true)
  assert.equal(badtzOne.length, 1)
  assert.equal(badtzTwo.length, 1)
})

test('catalog copy does not include removed labels or heavy subtitle', () => {
  const html = renderCatalog(catalog)

  assert.equal(html.includes('product-number'), false)
  assert.equal(html.includes('Card 01'), false)
  assert.equal(html.includes('Navegue por personagem'), false)
  assert.equal(html.includes('Cards disponíveis da Hello Kitty'), false)
  assert.equal(html.includes('Abrindo WhatsApp com a mensagem do produto selecionado.'), false)
  assert.equal(html.includes('HELLO KITTY [ 2,00 ]'), true)
  assert.equal(html.includes('HELLO KITTY [ 1,50 ]'), true)
  assert.equal(html.includes('KEROPPI [ 3,00 ]'), true)
  assert.equal(html.includes('KEROPPI [ 1,50 ]'), true)
  assert.equal(html.includes('BADTZ-MARU [ 2,00 ]'), true)
  assert.equal(html.includes('BADTZ-MARU [ 3,00 ]'), true)
  assert.equal(html.includes('notinha oficial da Sanrio'), true)
  assert.equal(html.includes('2 papéis de carta oficiais da Sanrio'), true)
})

test('catalog data keeps category icons and products outside HTML', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8')

  assert.equal(html.includes('HELLO KITTY [ 2,00 ]'), false)
  assert.equal(html.includes('id="catalog-root"'), true)
  assert.equal(catalog.categories.length, 9)

  catalog.categories.forEach(category => {
    assert.equal(typeof category.icon, 'string')
    assert.equal(fs.existsSync(path.join(__dirname, '..', category.icon)), true)
  })
})

function createSideButton(side, active) {
  const classes = new Set(active ? ['active'] : [])

  return {
    dataset: { side },
    attributes: {},
    classList: {
      toggle(className, shouldAdd) {
        if (shouldAdd) {
          classes.add(className)
          return
        }

        classes.delete(className)
      },
      has(className) {
        return classes.has(className)
      }
    },
    setAttribute(name, value) {
      this.attributes[name] = value
    }
  }
}
