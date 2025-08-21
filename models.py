from databases import db

class Propietario(db.Model):
    codigo_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(50), nullable=False)
    apellido = db.Column(db.String(50), nullable=False)
    dni = db.Column(db.String(20), nullable=False, unique=True)
    direccion = db.Column(db.String(200))

    def __str__(self):
        return (
            f'Id: {self.codigo_id},'
            f'Nombre: {self.nombre}'
            f'Apellido: {self.apellido}'
            f'Documento: {self.dni}'
            f'Direccion: {self.direccion}'
        )