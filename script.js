/**
 * @class Model
 *
 * Manages the data of the application.
 */
 class Model {
  constructor() {
    //Guardamos en el constructor this tareas el item del DOM tareas
    this.tareas = JSON.parse(localStorage.getItem('tareas')) || []
  }
  //Vinculamos al callback el cambio de la lista
  bindTareaListChanged(callback) {
    this.onTareaListChanged = callback
  }
  //Creamos el método commit con el que cambiara la lista de tareas conviertiendo a string y enviando al dom
  _commit(tareas) {
    this.onTareaListChanged(tareas)
    localStorage.setItem('tareas', JSON.stringify(tareas))
  }
  //Agregar tarea, el cual enviamos 3 parametros
  //id si el tamaño de la lista de tareas es mayor a 0 en la lista tareas se selecciona el id 
  //del arreglo  de la longitud del arreglo -1+1 o 1
  addTarea(tareaText) {
    const tarea = {
      id: this.tareas.length > 0 ? this.tareas[this.tareas.length - 1].id + 1 : 1,
      text: tareaText,
      complete: false,
    }
    // Se agrega a la lista con el comando push
    this.tareas.push(tarea)
    // y se hace commit
    this._commit(this.tareas)
  }
  // Para editar la tarea enviamos 2 parametros, del cual se mapea de la lista con el id seleccionado
  // y se hace commit
  editTarea(id, updatedText) {
    this.tareas = this.tareas.map(tarea =>
      tarea.id === id ? { id: tarea.id, text: updatedText, complete: tarea.complete } : tarea
    )

    this._commit(this.tareas)
  }
  // En eliminar tarea se usa un filtro para crear una nueva lista con todos los elementos menos del id 
  // que se elimino y se hace el commit
  deleteTarea(id) {
    this.tareas = this.tareas.filter(tarea => tarea.id !== id)

    this._commit(this.tareas)
  }
  //Seleccionador de tarea con el switch
  toggleTarea(id) {
    this.tareas = this.tareas.map(tarea =>
      tarea.id === id ? { id: tarea.id, text: tarea.text, complete: !tarea.complete } : tarea
    )

    this._commit(this.tareas)
  }
}

/**
 * @class View
 *
 * Visual representation of the model.
 */
class View {
  constructor() {
    //Todo lo que se renderiza en el dom se colocara en app
    this.app = this.getElement('#root')
    //Creamos el form
    this.form = this.createElement('form')
    //El tipo input con su place holder
    this.input = this.createElement('input')
    this.input.type = 'text'
    this.input.placeholder = 'Escribir tarea'
    this.input.name = 'tarea'
    //Boton para enviar
    this.submitButton = this.createElement('button')
    this.submitButton.textContent = 'Agregar'
    //Insertamos en el form el imput y el boton
    this.form.append(this.input, this.submitButton)
    //Creamos un título
    this.title = this.createElement('h1')
    this.title.textContent = 'Tareas'
    //Creamos la lista
    this.tareaList = this.createElement('ul', 'tarea-list')
    this.app.append(this.title, this.form, this.tareaList)
    //Creamos un texto temporal para la tarea
    this._temporaryTareaText = ''
    this._initLocalListeners()
  }
  //Recogemos el valor del input
  get _tareaText() {
    return this.input.value
  }
  //Metodo reset del input
  _resetInput() {
    this.input.value = ''
  }
  //Método para crear elementos
  createElement(tag, className) {
    const element = document.createElement(tag)

    if (className) element.classList.add(className)

    return element
  }
  //Metodo para seleccionar el elemento
  getElement(selector) {
    const element = document.querySelector(selector)

    return element
  }
  //Método para mostrar tareas en pantalla
  displayTareas(tareas) {
    // Delete all nodes
    while (this.tareaList.firstChild) {
      this.tareaList.removeChild(this.tareaList.firstChild)
    }

    // Muestra el mensaje por defecto
    if (tareas.length === 0) {
      const p = this.createElement('p')
      p.textContent = 'Nada que hacer! Agrega tus tareas?'
      this.tareaList.append(p)
    } else {
      // Create nodos con las tareas
      tareas.forEach(tarea => {
        const li = this.createElement('li')
        li.id = tarea.id

        const checkbox = this.createElement('input')
        checkbox.type = 'checkbox'
        checkbox.checked = tarea.complete

        const span = this.createElement('span')
        span.contentEditable = true
        span.classList.add('editable')

        if (tarea.complete) {
          const strike = this.createElement('s')
          strike.textContent = tarea.text
          span.append(strike)
        } else {
          span.textContent = tarea.text
        }

        const deleteButton = this.createElement('button', 'delete')
        deleteButton.textContent = 'Eliminar'
        li.append(checkbox, span, deleteButton)

        // Append nodes
        this.tareaList.append(li)
      })
    }

    // Debugging
    console.log(tareas)
  }
  //Iniciamos los event listener para que se active cuando se edite
  _initLocalListeners() {
    this.tareaList.addEventListener('input', event => {
      if (event.target.className === 'editable') {
        this._temporaryTareaText = event.target.innerText
      }
    })
  }
  //Event listener para cuando se agregue la tarea
  bindAddTarea(handler) {
    this.form.addEventListener('submit', event => {
      event.preventDefault()

      if (this._tareaText) {
        handler(this._tareaText)
        this._resetInput()
      }
    })
  }
  //Event listener para cuando se elimine la tarea
  bindDeleteTarea(handler) {
    this.tareaList.addEventListener('click', event => {
      if (event.target.className === 'delete') {
        const id = parseInt(event.target.parentElement.id)

        handler(id)
      }
    })
  }
  //Event listener para cuando se edite la tarea
  bindEditTarea(handler) {
    this.tareaList.addEventListener('focusout', event => {
      if (this._temporaryTareaText) {
        const id = parseInt(event.target.parentElement.id)

        handler(id, this._temporaryTareaText)
        this._temporaryTareaText = ''
      }
    })
  }
  //Event listener para cuando se seleccione la tarea
  bindToggleTarea(handler) {
    this.tareaList.addEventListener('change', event => {
      if (event.target.type === 'checkbox') {
        const id = parseInt(event.target.parentElement.id)

        handler(id)
      }
    })
  }
}

/**
 * @class Controller
 *
 * Links the user input and the view output.
 *
 * @param model
 * @param view
 */
class Controller {
  constructor(model, view) {
    this.model = model
    this.view = view

    // Vinculacción del modelo con la vista 
    this.model.bindTareaListChanged(this.onTareaListChanged)
    this.view.bindAddTarea(this.handleAddTarea)
    this.view.bindEditTarea(this.handleEditTarea)
    this.view.bindDeleteTarea(this.handleDeleteTarea)
    this.view.bindToggleTarea(this.handleToggleTarea)

    this.onTareaListChanged(this.model.tareas)
  }

  onTareaListChanged = tareas => {
    this.view.displayTareas(tareas)
  }

  handleAddTarea = tareaText => {
    this.model.addTarea(tareaText)
  }

  handleEditTarea = (id, tareaText) => {
    this.model.editTarea(id, tareaText)
  }

  handleDeleteTarea = id => {
    this.model.deleteTarea(id)
  }

  handleToggleTarea = id => {
    this.model.toggleTarea(id)
  }
}

const app = new Controller(new Model(), new View())
