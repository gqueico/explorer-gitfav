import { GithubUser } from './GithubUser.js'

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@gitfav:')) || []
  }

  save() {
    localStorage.setItem('@gitfav:', JSON.stringify(this.entries))
  }

  async add(username) {
    try {
      const userExists = this.entries.find(entry => entry.login === username)

      if(userExists) {
        throw new Error(`${username} já foi favoritado!`)
      }

      const user = await GithubUser.search(username)

      if(user.login === undefined) {
        throw new Error('Perfil não encontrado!')
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()

    } catch(error) {
      alert(error.message)
      this.update()
    }
  }

  delete(user) {
    this.entries = this.entries.filter(entry => entry.login !== user.login)
    this.update()
    this.save()
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('table tbody')

    this.update()
    this.onadd()
  }

  onadd() {
    const addFavorite = this.root.querySelector('.search button')

    window.document.onkeydown = event => {
      if(event.key === 'Enter'){ 
        const { value } = this.root.querySelector('.search input')

        this.add(value)
      }
    }

    addFavorite.onclick = () => {
     const { value } = this.root.querySelector('.search input')
     
     this.add(value)
    }
  }

  update() {
    this.noFavorite()
    this.removeAllTr()
    this.clearInput()

    this.entries.forEach(user => {
      const row = this.createRow()
      
      row.querySelector('.user img').src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem de ${user.name}`
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user a').target = '_blank'
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user span').textContent = `/${user.login}`
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers

      row.querySelector('.remove').onclick = () => {
        const isOK = confirm(`Deseja remover ${user.name}`)

        if(isOK) {
          this.delete(user)
        }
      }

      this.tbody.append(row)
    })
  }

  createRow() {
    const tr = document.createElement('tr')

    tr.innerHTML = `
      <td class="user">
        <img src="" alt="">
        <a href="" target="_blank">
          <p></p>
          <span></span>
        </a>
      </td>
      <td class="repositories"></td>
      <td class="followers"></td>
      <td>
        <button class="remove">Remover</button>
      </td>
    `
    return tr
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr').forEach(tr => tr.remove())
  }

  clearInput() {
    const input = this.root.querySelector('.search input')
    input.value = ''
  }

  noFavorite() {
    const emptyFavorites = this.root.querySelector('.no__favorites')
    
    if(this.entries.length === 0) {
      emptyFavorites.classList.add('show')
    } else {
      emptyFavorites.classList.remove('show')
    }
  }
}