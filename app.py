from flask import Flask, jsonify, render_template
from flask_migrate import Migrate
from models import Propietario
from databases import db
from forms import PropietarioForm
app = Flask(__name__)

#Configuracion de la Base de Datos
USER_DB = 'root'
PASS_DB = 'root'
URL_DB = 'localhost'
PORT_DB = 3306
NAME_DB = 'SGM_Flask_db'

# URL de conexión para MySQL con mysql-connector-python
FULL_URL_DB = f'mysql+mysqlconnector://{USER_DB}:{PASS_DB}@{URL_DB}:{PORT_DB}/{NAME_DB}'
#configuracion SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = FULL_URL_DB
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicialización del obj db de sqlalchemy
# db = SQLAlchemy(app)
db.init_app(app)

#Configuracion de flask-migrate
migrate = Migrate()
migrate.init_app(app,db)
#flask db init (Crera la carpeta de migraciones)
#flask db migrate (se crea el archivo que tiene la representacion del mapeo entre la clase del modelo y la representacion de la tabla en la BD)
#flask db upgrade (se guardan los cambios en la base de datos)
#flask db stamp head (verificamos si esta todo actualizado)
# ----(si hacemos modificaciones sobre la clase modelo)
# flask db migrate
# flask db upgrade

 # configuramos una variable que permite configurar llaves csrf
 #configuracion de flask-wtf
app.config['SECRET_KEY'] = 'llave_secreta'
#LISTADO DE PROPIETARIOS
@app.route('/')
@app.route('/index')
@app.route('/index.html')
def inicio():    
    #Listado de Propietarios
    propietario = Propietario.query.all()
    total_Prop = Propietario.query.count()
    app.logger.debug(f'Listado Propietarios: {propietario}')
    app.logger.debug(f'Total Propietarios: {total_Prop}')
    #objeto de tipo formulario WTF
    forma = PropietarioForm()   # ← Para mostrar el formulario vacío
    return render_template('index.html', propietario=propietario, total_prop=total_Prop, forma=forma)

#DETALLE DE 1 PROPIETARIO
@app.route('/ver/<int:id>')
def ver_detalle(id):
    propietario = Propietario.query.get_or_404(id)
    app.logger.debug(f'Nombre -----> {propietario.nombre} - {propietario.apellido}')
    # Retorna JSON en lugar de HTML
    return {
        'codigo_id': propietario.codigo_id,
        'nombre': propietario.nombre,
        'apellido': propietario.apellido,
        'dni': propietario.dni,
        'direccion': propietario.direccion
    }

#AGREGAR UN PROPIETARIO
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

#     return render_template('index.html', forma=propietarioForm)

@app.route('/agregar', methods=['POST'])
def agregar():
    forma = PropietarioForm()    # ← Para procesar los datos enviados
    if forma.validate_on_submit():
        try:
            # Procesar datos del formulario
            # Creo instancia del modelo
            nuevo_propietario = Propietario(
                nombre=forma.nombre.data,
                apellido=forma.apellido.data,
                dni=forma.dni.data,
                direccion=forma.direccion.data
            )
            app.logger.debug(f'Persona a insertar: {nuevo_propietario}')
            db.session.add(nuevo_propietario)
            db.session.commit()
            
            return jsonify({
                'success': True,
                'propietario': {
                    'codigo_id': nuevo_propietario.codigo_id,   # <- útil si luego quieres borrar/editar
                    'nombre': nuevo_propietario.nombre,
                    'apellido': nuevo_propietario.apellido,
                    'dni': nuevo_propietario.dni,
                    'direccion': nuevo_propietario.direccion
                }
            })

        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'error': str(e)}), 500
    # Si no valida, enviar error
    return jsonify({'success': False, 'error': 'Formulario inválido'}), 400
    # return render_template('index.html', forma=forma) no se usa ya que rabajams con AJAX

if __name__== '__main__':
    app.run(debug=True)