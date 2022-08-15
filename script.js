class Model 
{
    constructor()//���캯������ʼ������
    {
        //���ش洢
        this.todos = JSON.parse(localStorage.getItem('todos')) || []
    }

    //�ص�������ÿ���޸������ݺ����controller��
    //onTodoListChanged����,֪ͨview������ͼ
    bindTodoListChanged(callback)
    {
        this.onTodoListChanged = callback
    }

    //�ص������±����ڴ�
    commit(todos)
    {
        this.onTodoListChanged(todos)
        localStorage.setItem('todos', JSON.stringify(todos))
    }

    addTodo(todoText)//���һ��todo��Ŀ
    {
        //����һ��todo��Ȼ�����todos��
        const todo = 
        {
            id: this.todos.length > 0 ? this.todos[this.todos.length - 1].id + 1 : 1,
            text: todoText,
            complete: false,
        }
        this.todos.push(todo)
        this.commit(this.todos)
    }

    deleteTodo(id)//ɾ��һ��todo��Ŀ
    {
        //����filter��������ָ����id�˳�
        this.todos = this.todos.filter(todo => todo.id !== id)
        this.commit(this.todos)
    }

    editTodo(id, newtext)//����todo���ı�����
    {
        //����map��������todos���ҵ�ָ��id�͸���text�����򱣳�todo����
        this.todos = this.todos.map(todo => todo.id === id ?
            { id: id, text: newtext, complete: todo.complete} : todo)
        this.commit(this.todos)   
    }

    toggleTodo(id)//�޸�todo��Ŀ��״̬
    {
        //����map�ҵ�����todo���޸�complete
        this.todos = this.todos.map(todo => todo.id === id ?
            { id: id, text: todo.text, complete: !todo.complete} : todo)
        this.commit(this.todos)
    }
}

class View 
{
    constructor() 
    {
        //��ȡ��Ԫ��
        this.list = this.getElement('#root')

        //���ñ���
        this.title = this.createElement('h1')
        this.title.textContent = 'Todos'

        //����
        this.form = this.createElement('form')
    
        //��������ѡ��
        this.input = this.createElement('input')
        this.input.type = 'text'
        this.input.placeholder = 'Add a todo item'
        this.input.name = 'todo'

        //�ύ��ť
        this.submitButton = this.createElement('button')
        this.submitButton.textContent = 'Submit'

        //����ӵ�tolo�б�
        this.todoList = this.createElement('ul', 'todo-list')
        
        //����form
        this.form.append(this.input, this.submitButton)

        //����list
        this.list.append(this.title, this.form, this.todoList)
    
        //��ʱ����������ʵʱ�޸��ı�
        this.temporaryTodoText = ''
        this.initLocalListeners()
    }

    createElement(tag, className)//��dom�д�����Ԫ��
    {
        const element = document.createElement(tag)
        if(className)
        {
            //�����һ���࣬����µ�����
            element.classList.add(className)
        }
        return element
    }

    getElement(selector)//��dom�л�ȡԪ��
    {
        //����cssѡ����
        const element = document.querySelector(selector)
        return element
    }

    //��ȡinput��ֵ
    get todoText()
    {
        return this.input.value
    }
    //����inputֵ
    resetInput()
    {
        this.input.value = ''
    }

    displayTodos(todos)//��ʾ��������
    {
        //�����todoList��Ϊ����todoList��׼��
        while(this.todoList.firstChild)
        {
            this.todoList.removeChild(this.todoList.firstChild)
        }
        
        //todosΪ�գ���ʾ'Empty list'
        if(todos.length === 0)
        {
            const p = this.createElement('p')
            p.textContent = 'Empty list'
            this.todoList.append(p)
        }
        //todos�ǿգ���ʾÿ��todo����
        else
        {
           todos.forEach(todo=>{
            //ÿ��todo��һ��li��ʶ
            const li = this.createElement('li')
            li.id = todo.id

            //Ϊÿ��todo���ø�ѡ���ı����ɾ����ť
            //��Ӹ�ѡ��
            const checkbox = this.createElement('input')
            checkbox.type = 'checkbox'
            checkbox.checked = todo.complete

            //��ӿɱ༭���ı���
            const span = this.createElement("span")
            span.contentEditable = true
            span.classList.add('editable')

            //���ѡ���˸�ѡ�򣬼���todo��Ϊcomplete�����ɾ����
            if(todo.complete)
            {
                const strike = this.createElement('s')
                strike.textContent = todo.text
                span.append(strike)
            }
            else
            {
                span.textContent = todo.text
            }

            //���ɾ����ť
            const deleteButton = this.createElement('button', 'delete')
            deleteButton.textContent = 'Delete'
            
            //����Ԫ�����뵽��Ԫ����
            li.append(checkbox, span, deleteButton)
            this.todoList.append(li)
           })
        }
    }

    //�¼�����������ͼ�з���������������س������룩
    //����controller����model����Ӧ�����޸�����
    bindAddTodo(handler)
    {
        this.form.addEventListener('submit', event=>
        {
            event.preventDefault()
            if(this.todoText)
            {
                handler(this.todoText)
                this.resetInput()
            }
        })
    }

    bindDeleteTodo(handler)
    {
        this.todoList.addEventListener('click', event=>
        {
            if(event.target.className === 'delete')
            {
                const id = parseInt(event.target.parentElement.id)
                handler(id)
            }
        })
    }

    bindToggleTodo(handler)
    {
        this.todoList.addEventListener('change', event=>
        {
            if(event.target.type === 'checkbox')
            {
                const id = parseInt(event.target.parentElement.id)
                handler(id);
            }
        })
    }

    bindEditTodo(handler)
    {
        this.todoList.addEventListener('focusout',event=>
        {
            if(this.temporaryTodoText)
            {
                const id = parseInt(event.target.parentElement.id)
            }
            handler(id, this.temporaryTodoText)
            this.temporaryTodoText = ''
        })
    }

    //��ȡ�ı����ʵʱ����
    initLocalListeners()
    {
        this.todoList.addEventListener('input', event=>
        {
            if(event.target.className === 'editable')
            {
                this.temporaryTodoText = event.target.innerText
            }
        })
    }
}

class Controller {
    constructor(m, v) 
    {
        this.model = m
        this.view = v

        //��ģ�͵��¼�����
        this.model.bindTodoListChanged(this.onTodoListChanged)
        
        //����ͼ���¼�����
        this.view.bindAddTodo(this.handleAddTodo)
        this.view.bindDeleteTodo(this.handleDeleteTodo)
        this.view.bindToggleTodo(this.handleToggleTodo)
        this.view.bindEditTodo(this.handleEditTodo)

        //�ڹ��캯���е���һ�Σ���ʾ��ʼtodolist
        this.onTodoListChanged(this.model.todos)
    }

    //����model����view
    onTodoListChanged = todos=>
    {
        this.view.displayTodos(todos)
    }

    //���к�������view����model��

    //�޸���ʱֵ
    handleEditTodo = (id, todoText)=>
    {
        this.model.editTodo(id, todoText)
    }
    //������룬��������������µ�todo
    handleAddTodo = todoText=>
    {
        this.model.addTodo(todoText)
    }
    //���ɾ����ť
    handleDeleteTodo = id=>
    {
        this.model.deleteTodo(id)
    }
    //��⸴ѡ��
    handleToggleTodo = id=>
    {
        this.model.toggleTodo(id)
    }
}

const list = new Controller(new Model(), new View)