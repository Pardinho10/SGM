from wtforms.validators import DataRequired
from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField

class PropietarioForm(FlaskForm):
    nombre = StringField('Nombre', validators=[DataRequired()])
    apellido = StringField('Apellido', validators=[DataRequired()])
    dni = StringField('Documento', validators=[DataRequired()])
    direccion = StringField('Dirección', validators=[DataRequired()])
    enviar = SubmitField('Enviar', render_kw={"class": "btn btn-success"})
