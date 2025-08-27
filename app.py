from flask import Flask, jsonify, redirect, render_template, request, url_for
from flask_migrate import Migrate
from models import Propietario
from databases import db
from forms import PropietarioForm

# =========================================================================
#                   Configuración de la Aplicación y la Base de Datos
# =========================================================================
app = Flask(__name__)

# Configuración de la conexión a la base de datos MySQL
USER_DB = 'root'
PASS_DB = 'root'
URL_DB = 'localhost'
PORT_DB = 3306
NAME_DB = 'SGM_Flask_db'

# URL completa de la base de datos para SQLAlchemy
FULL_URL_DB = f'mysql+mysqlconnector://{USER_DB}:{PASS_DB}@{URL_DB}:{PORT_DB}/{NAME_DB}'
app.config['SQLALCHEMY_DATABASE_URI'] = FULL_URL_DB
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# =========================================================================
#                             Inicialización de Extensiones
# =========================================================================
# Inicialización de la base de datos de SQLAlchemy
db.init_app(app)

# Configuración de flask-migrate para gestionar migraciones de la base de datos
migrate = Migrate()
migrate.init_app(app, db)
#flask db init (Crea la carpeta de migraciones)
#flask db migrate (se crea el archivo que tiene la representacion del mapeo entre la clase del modelo y la representacion de la tabla en la BD)
#flask db upgrade (se guardan los cambios en la base de datos)
#flask db stamp head (verificamos si esta todo actualizado)
# ----(si hacemos modificaciones sobre la clase modelo)
# flask db migrate
# flask db upgrade
# Configuración de la llave secreta para Flask-WTF y seguridad
app.config['SECRET_KEY'] = 'llave_secreta'


# =========================================================================
#                               Rutas de la Aplicación (CRUD)
# =========================================================================

# --- RUTA PRINCIPAL: LISTADO DE PROPIETARIOS ---
@app.route('/')
@app.route('/index')
@app.route('/index.html')
def inicio():
    """
    Ruta principal que muestra el listado de todos los propietarios.
    También prepara el formulario para agregar un nuevo propietario.
    """
    propietarios = Propietario.query.all()
    total_propietarios = Propietario.query.count()
    app.logger.debug(f'Listado de Propietarios: {propietarios}')
    app.logger.debug(f'Total de Propietarios: {total_propietarios}')
    forma = PropietarioForm()
    return render_template('index.html', propietario=propietarios, total_prop=total_propietarios, forma=forma)


# --- RUTA PARA VER DETALLES DE UN PROPIETARIO ---
@app.route('/ver/<int:id>')
def ver_detalle(id):
    """
    Ruta para obtener los detalles de un propietario específico.
    Retorna un objeto JSON con los datos del propietario.
    """
    propietario = Propietario.query.get_or_404(id)
    app.logger.debug(f'Detalles de propietario: {propietario.nombre} - {propietario.apellido}')
    return jsonify({
        'codigo_id': propietario.codigo_id,
        'nombre': propietario.nombre,
        'apellido': propietario.apellido,
        'dni': propietario.dni,
        'direccion': propietario.direccion
    })


# --- RUTA PARA AGREGAR UN PROPIETARIO (vía AJAX) ---
@app.route('/agregar', methods=['POST'])
def agregar():
    """
    Procesa los datos enviados desde el formulario para agregar un nuevo propietario.
    Retorna un JSON indicando el éxito o fracaso de la operación.
    """
    forma = PropietarioForm()
    if forma.validate_on_submit():
        try:
            # Verifica si el código ID ya existe antes de agregar
            existe = Propietario.query.filter_by(codigo_id=forma.codigo_id.data).first()
            if existe:
                return jsonify({'success': False, 'error': 'El código ID ya existe'}), 400

            nuevo_propietario = Propietario(
                codigo_id=forma.codigo_id.data,
                nombre=forma.nombre.data,
                apellido=forma.apellido.data,
                dni=forma.dni.data,
                direccion=forma.direccion.data
            )
            db.session.add(nuevo_propietario)
            db.session.commit()

            return jsonify({
                'success': True,
                'propietario': {
                    'codigo_id': nuevo_propietario.codigo_id,
                    'nombre': nuevo_propietario.nombre,
                    'apellido': nuevo_propietario.apellido,
                    'dni': nuevo_propietario.dni,
                    'direccion': nuevo_propietario.direccion
                }
            })
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'error': str(e)}), 500
    
    # En caso de que el formulario no sea válido
    return jsonify({'success': False, 'error': 'Formulario inválido'}), 400


# --- RUTA PARA OBTENER DATOS DE UN PROPIETARIO PARA EDICIÓN ---
@app.route('/editar/<int:id>')
def editar(id):
    """
    Obtiene los datos de un propietario específico para ser editados en el formulario.
    Retorna los datos en formato JSON.
    """
    propietario = Propietario.query.get_or_404(id)
    return jsonify({
        'codigo_id': propietario.codigo_id,
        'nombre': propietario.nombre,
        'apellido': propietario.apellido,
        'dni': propietario.dni,
        'direccion': propietario.direccion
    })


# --- RUTA PARA ACTUALIZAR UN PROPIETARIO (vía AJAX) ---
@app.route('/actualizar/<int:id>', methods=['POST', 'PUT'])
def actualizar(id):
    """
    Procesa la actualización de los datos de un propietario.
    Retorna un JSON con el resultado de la operación.
    """
    propietario = Propietario.query.get_or_404(id)
    forma = PropietarioForm(request.form)

    if forma.validate_on_submit():
        try:
            # Si se cambia el código ID, se verifica que no exista otro igual
            if forma.codigo_id.data != propietario.codigo_id:
                existe = Propietario.query.filter_by(codigo_id=forma.codigo_id.data).first()
                if existe:
                    return jsonify({'success': False, 'error': 'El código ID ya existe'}), 400
            
            propietario.codigo_id = forma.codigo_id.data 
            propietario.nombre = forma.nombre.data
            propietario.apellido = forma.apellido.data
            propietario.dni = forma.dni.data
            propietario.direccion = forma.direccion.data
            db.session.commit()

            return jsonify({
                'success': True,
                'propietario': {
                    'codigo_id': propietario.codigo_id,
                    'nombre': propietario.nombre,
                    'apellido': propietario.apellido,
                    'dni': propietario.dni,
                    'direccion': propietario.direccion
                }
            })
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'error': str(e)}), 500
    
    return jsonify({'success': False, 'error': 'Formulario inválido', 'errors': forma.errors}), 400


# --- RUTA PARA ELIMINAR UN PROPIETARIO (vía AJAX) ---
@app.route('/eliminar/<int:id>', methods=['DELETE'])
def eliminar(id):
    """
    Elimina un registro de propietario de la base de datos.
    Retorna un JSON indicando el éxito o fracaso de la operación.
    """
    try:
        propietario = Propietario.query.get_or_404(id)
        app.logger.debug(f'Usuario a eliminar: {propietario.nombre} - {propietario.apellido}')
        db.session.delete(propietario)
        db.session.commit()
        return jsonify({ 'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


# =========================================================================
#                            Manejo de la Aplicación
# =========================================================================
if __name__ == '__main__':
    app.run(debug=True)



# <-------CODIGO CRUD SIN AJAX ------>

""" #AGREGAR UN PROPIETARIO
# @app.route('/agregar', methods=['GET', 'POST'])
# def agregar():
#     propietario = Propietario()
#     propietarioForm = PropietarioForm(obj=propietario)
    # if request.method == 'POST':
    #     if propietarioForm.validate_on_submit():
    #         propietarioForm.populate_obj(propietario)
    #         app.logger.debug(f'Persona a insertar: {propietario}')
    #         #insertamos registro
    #         db.session.add(propietario)
    #         db.session.commit()
    # return redirect(url_for('inicio'))

#     return render_template('index.html', forma=propietarioForm) """

#EDITAR PROPIETARIO SIN AJAX
""" 
@app.route('/editar/<int:id>')
def editar(id):
    propietario = Propietario.query.get_or_404(id)
    propietarioForm = PropietarioForm(obj=propietario)
     if request.method == 'POST':
         if propietarioForm.validate_on_submit():
             propietarioForm.populate_obj(propietario)
             app.logger.debug(f'Persona a actualizar: {propietario}')
             #insertamos registro
             db.session.commit()
    # return redirect(url_for('inicio'))
    return render_template('index.html', forma=propietarioForm)
 """

#ELIMINAR PROPIETARIO SIN AJAX
""" @app.route('/eliminar/<int:id>')
def eliminar(id):
    propietario = Propietario.query.get_or_404(id)
    app.logger.debug(f'Nombre -----> {propietario.nombre} - {propietario.apellido}')
    db.session.delete(propietario)
    db.session.commit()
    return redirect(url_for('inicio')) """