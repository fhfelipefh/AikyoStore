const nav = document.querySelector('#header nav')
const header = document.querySelector('#header')
const toggles = document.querySelectorAll('nav .toggle')
const links = document.querySelectorAll('nav ul li a')
const sections = document.querySelectorAll('main section[id]')
const backToTopButton = document.querySelector('.back-to-top')
const themeButton = document.getElementById('theme-toggle')
const yearSpan = document.getElementById('current-year')
const themeStorageKey = 'aikyo-theme'

function setMenuState(isOpen) {
  nav.classList.toggle('show', isOpen)
  document.body.classList.toggle('nav-open', isOpen)

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

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    setMenuState(false)
  }
})

function changeHeaderWhenScroll() {
  header.classList.toggle('scroll', window.scrollY >= header.offsetHeight)
}

function backToTop() {
  backToTopButton.classList.toggle('show', window.scrollY >= 560)
}

function activateMenuAtCurrentSection() {
  const checkpoint = window.pageYOffset + (window.innerHeight / 8) * 4

  sections.forEach(section => {
    const sectionTop = section.offsetTop
    const sectionHeight = section.offsetHeight
    const sectionId = section.getAttribute('id')
    const link = document.querySelector(`nav ul li a[href="#${sectionId}"]`)

    if (!link) return

    const checkpointStart = checkpoint >= sectionTop
    const checkpointEnd = checkpoint <= sectionTop + sectionHeight
    link.classList.toggle('active', checkpointStart && checkpointEnd)
  })
}

function applyTheme(theme) {
  const isDark = theme === 'dark'
  document.body.classList.toggle('dark', isDark)

  if (!themeButton) return

  const icon = themeButton.querySelector('span')

  if (icon) {
    icon.textContent = isDark ? 'light_mode' : 'dark_mode'
  }
}

if (themeButton) {
  const savedTheme = localStorage.getItem(themeStorageKey)
  const initialTheme = savedTheme || 'light'

  applyTheme(initialTheme)

  themeButton.addEventListener('click', () => {
    const nextTheme = document.body.classList.contains('dark') ? 'light' : 'dark'
    applyTheme(nextTheme)
    localStorage.setItem(themeStorageKey, nextTheme)
  })
}

if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear()
}

window.addEventListener(
  'scroll',
  () => {
    changeHeaderWhenScroll()
    backToTop()
    activateMenuAtCurrentSection()
  },
  { passive: true }
)

window.addEventListener('resize', () => {
  if (window.innerWidth >= 1120) {
    setMenuState(false)
  }
})

changeHeaderWhenScroll()
backToTop()
activateMenuAtCurrentSection()
