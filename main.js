const themeStorageKey = 'aikyo-theme'
const whatsappPhone = '555491106565'
const catalogUrl = 'data/catalog.json?v=20260628-1'

function buildWhatsAppMessage(product, category) {
  const selectedProduct = product || 'Produto Sanrio'
  const selectedCategory = category || 'Sanrio'

  return `Olá! Quero comprar: ${selectedProduct}. Categoria: ${selectedCategory}. Você pode me passar disponibilidade, valor e forma de pagamento?`
}

function buildWhatsAppUrl(product, category) {
  return `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(buildWhatsAppMessage(product, category))}`
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderCatalog(catalog) {
  return (catalog.categories || []).map(renderCategory).join('')
}

function renderCategory(category) {
  const products = category.products || []
  const productGrid = products.length
    ? `<div class="product-grid">${products.map(product => renderProduct(product, category)).join('')}</div>`
    : ''
  const emptyClass = products.length ? '' : ' empty'
  const titleId = `${category.id}-title`

  return `
    <section class="character-section${emptyClass}" id="${escapeHtml(category.id)}" aria-labelledby="${escapeHtml(titleId)}">
      <div class="character-heading">
        <img class="category-mark" src="${escapeHtml(category.icon)}" alt="" width="160" height="160" loading="lazy" decoding="async" />
        <h3 class="title" id="${escapeHtml(titleId)}">${escapeHtml(category.name)}</h3>
      </div>
      ${productGrid}
    </section>
  `
}

function renderProduct(product, category) {
  const categoryName = product.category || category.name
  const hasBack = Boolean(product.backImage)
  const sideToggle = hasBack
    ? `
      <div class="side-toggle" aria-label="Alternar visual do card">
        <button class="side-button active" type="button" data-side="front" aria-pressed="true">Frente</button>
        <button class="side-button" type="button" data-side="back" aria-pressed="false">Verso</button>
      </div>
    `
    : ''

  return `
    <article
      class="card product-card"
      data-front-src="${escapeHtml(product.frontImage)}"
      data-back-src="${escapeHtml(product.backImage || '')}"
      data-front-alt="${escapeHtml(product.frontAlt || product.title)}"
      data-back-alt="${escapeHtml(product.backAlt || '')}"
    >
      <div class="product-media">
        <img
          src="${escapeHtml(product.frontImage)}"
          alt="${escapeHtml(product.frontAlt || product.title)}"
          width="1600"
          height="1600"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div class="product-content">
        <h4 class="title">${escapeHtml(product.title)}</h4>
        ${renderProductDetails(product.description)}
        ${sideToggle}
        <a
          class="button buy-button"
          href="${escapeHtml(buildWhatsAppUrl(product.title, categoryName))}"
          target="_blank"
          rel="noreferrer"
          data-product="${escapeHtml(product.title)}"
          data-category="${escapeHtml(categoryName)}"
        >
          Comprar
        </a>
      </div>
    </article>
  `
}

function renderProductDetails(details = []) {
  if (!details.length) return ''

  return `<ul class="product-details">${details.map(detail => `<li>${escapeHtml(detail)}</li>`).join('')}</ul>`
}

function setProductSide(card, side) {
  const img = card.querySelector('.product-media img')
  const buttons = card.querySelectorAll('.side-button')
  const isBack = side === 'back'
  const nextSrc = isBack ? card.dataset.backSrc : card.dataset.frontSrc
  const nextAlt = isBack ? card.dataset.backAlt : card.dataset.frontAlt

  if (!img || !nextSrc) return false

  img.src = nextSrc
  img.alt = nextAlt || img.alt

  buttons.forEach(button => {
    const isActive = button.dataset.side === side
    button.classList.toggle('active', isActive)
    button.setAttribute('aria-pressed', String(isActive))
  })

  return true
}

async function loadCatalog(documentRef, windowRef) {
  const catalogRoot = documentRef.getElementById('catalog-root')

  if (!catalogRoot) return

  try {
    const response = await windowRef.fetch(catalogUrl)

    if (!response.ok) {
      throw new Error(`Falha ao carregar catálogo: ${response.status}`)
    }

    const catalog = await response.json()
    catalogRoot.innerHTML = renderCatalog(catalog)
  } catch (error) {
    catalogRoot.innerHTML = '<p class="catalog-error">Não foi possível carregar o catálogo agora.</p>'
  }
}

function initProductInteractions(documentRef = document) {
  const buyButtons = documentRef.querySelectorAll('.buy-button')
  const whatsappNote = documentRef.getElementById('whatsapp-note')

  buyButtons.forEach(button => {
    const url = buildWhatsAppUrl(button.dataset.product, button.dataset.category)
    button.href = url

    button.addEventListener('click', () => {
      if (!whatsappNote) return

      whatsappNote.textContent = 'Abrindo WhatsApp com a mensagem do produto selecionado.'
    })
  })

  documentRef.querySelectorAll('.product-card').forEach(card => {
    card.querySelectorAll('.side-button').forEach(button => {
      button.addEventListener('click', () => {
        setProductSide(card, button.dataset.side)
      })
    })
  })
}

async function initPage(documentRef = document, windowRef = window) {
  const nav = documentRef.querySelector('#header nav')
  const header = documentRef.querySelector('#header')
  const toggles = documentRef.querySelectorAll('nav .toggle')
  const links = documentRef.querySelectorAll('nav ul li a')
  const sections = documentRef.querySelectorAll('main section[id]')
  const backToTopButton = documentRef.querySelector('.back-to-top')
  const themeButton = documentRef.getElementById('theme-toggle')
  const yearSpan = documentRef.getElementById('current-year')

  function setMenuState(isOpen) {
    if (!nav) return

    nav.classList.toggle('show', isOpen)
    documentRef.body.classList.toggle('nav-open', isOpen)

    toggles.forEach(toggle => {
      toggle.setAttribute('aria-expanded', String(isOpen))
    })
  }

  toggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      setMenuState(!nav.classList.contains('show'))
    })
  })

  links.forEach(link => {
    link.addEventListener('click', () => {
      setMenuState(false)
    })
  })

  documentRef.querySelectorAll('.nav-dropdown .submenu a').forEach(link => {
    link.addEventListener('click', () => {
      const dropdown = link.closest('details')

      if (dropdown) {
        dropdown.removeAttribute('open')
      }
    })
  })

  documentRef.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      setMenuState(false)
    }
  })

  function changeHeaderWhenScroll() {
    if (!header) return

    header.classList.toggle('scroll', windowRef.scrollY >= header.offsetHeight)
  }

  function backToTop() {
    if (!backToTopButton) return

    backToTopButton.classList.toggle('show', windowRef.scrollY >= 560)
  }

  function activateMenuAtCurrentSection() {
    const checkpoint = windowRef.pageYOffset + (windowRef.innerHeight / 8) * 4

    sections.forEach(section => {
      const sectionTop = section.offsetTop
      const sectionHeight = section.offsetHeight
      const sectionId = section.getAttribute('id')
      const link = documentRef.querySelector(`nav ul li a[href="#${sectionId}"]`)

      if (!link) return

      const checkpointStart = checkpoint >= sectionTop
      const checkpointEnd = checkpoint <= sectionTop + sectionHeight
      link.classList.toggle('active', checkpointStart && checkpointEnd)
    })
  }

  function applyTheme(theme) {
    const isDark = theme === 'dark'
    documentRef.body.classList.toggle('dark', isDark)

    if (!themeButton) return

    const icon = themeButton.querySelector('span')

    if (icon) {
      icon.textContent = isDark ? 'light_mode' : 'dark_mode'
    }
  }

  if (themeButton) {
    const savedTheme = windowRef.localStorage.getItem(themeStorageKey)
    const initialTheme = savedTheme || 'light'

    applyTheme(initialTheme)

    themeButton.addEventListener('click', () => {
      const nextTheme = documentRef.body.classList.contains('dark') ? 'light' : 'dark'
      applyTheme(nextTheme)
      windowRef.localStorage.setItem(themeStorageKey, nextTheme)
    })
  }

  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear()
  }

  await loadCatalog(documentRef, windowRef)
  initProductInteractions(documentRef)

  windowRef.addEventListener(
    'scroll',
    () => {
      changeHeaderWhenScroll()
      backToTop()
      activateMenuAtCurrentSection()
    },
    { passive: true }
  )

  windowRef.addEventListener('resize', () => {
    if (windowRef.innerWidth >= 1120) {
      setMenuState(false)
    }
  })

  changeHeaderWhenScroll()
  backToTop()
  activateMenuAtCurrentSection()
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  initPage()
}

if (typeof module !== 'undefined') {
  module.exports = {
    buildWhatsAppMessage,
    buildWhatsAppUrl,
    escapeHtml,
    renderCatalog,
    renderCategory,
    renderProduct,
    setProductSide,
    whatsappPhone
  }
}
