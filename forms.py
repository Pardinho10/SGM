from wtforms.validators import DataRequired
from flask_wtf import FlaskForm
from wtforms import IntegerField, StringField, SubmitField

class PropietarioForm(FlaskForm):
    codigo_id = IntegerField('Código ID', validators=[DataRequired()])
    nombre = StringField('Nombre', validators=[DataRequired()])
    apellido = StringField('Apellido', validators=[DataRequired()])
    dni = StringField('Documento', validators=[DataRequired()])
    direccion = StringField('Dirección', validators=[DataRequired()])
    enviar = SubmitField('Enviar', render_kw={"class": "btn btn-success"})
