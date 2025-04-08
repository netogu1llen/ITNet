CREATE TABLE expediente (
    IDExpediente INT AUTO_INCREMENT PRIMARY KEY,
    nombres VARCHAR(50),
    apellidoP VARCHAR(30),
    apellidoM VARCHAR(30),
    numExpediente VARCHAR(15),
    fechaNacimiento DATE,
    contacto VARCHAR(15),
    direccion VARCHAR(100),
    enfermedades VARCHAR(255),
    medicamentos VARCHAR(255),
    estudioSocioeconomico VARCHAR(100),
    grado VARCHAR(20),
    curso VARCHAR(50),
    sangre VARCHAR(3),
    eliminado BOOLEAN
);

CREATE TABLE usuario (
    IDUsuario INT AUTO_INCREMENT PRIMARY KEY,
    nombreUsuario VARCHAR(50),
    numTelefono VARCHAR(10),
    fechaNacimiento DATE,
    contrasena VARCHAR(20)
);

CREATE TABLE rol (
    IDRol INT AUTO_INCREMENT PRIMARY KEY,
    Tipo VARCHAR(30),
    eliminado BOOLEAN
);

CREATE TABLE privilegios (
    IDPrivilegio INT AUTO_INCREMENT PRIMARY KEY,
    Actividad VARCHAR(100),
    eliminado BOOLEAN
);

CREATE TABLE materia (
    IDMateria INT AUTO_INCREMENT PRIMARY KEY,
    materia VARCHAR(50),
    nvEscolar VARCHAR(20),
    grado VARCHAR(10),
    eliminado BOOLEAN
);

CREATE TABLE boleta (
    IDBoleta INT AUTO_INCREMENT PRIMARY KEY,
    IDExpediente INT,
    periodoEscolar VARCHAR(20),
    grado VARCHAR(20),
    eliminado BOOLEAN,
    FOREIGN KEY (IDExpediente) REFERENCES expediente(IDExpediente)
);

CREATE TABLE documentosAdjuntos (
    IDDocumento INT AUTO_INCREMENT PRIMARY KEY,
    IDExpediente INT,
    nombre VARCHAR(100),
    ubicacion VARCHAR(255),
    fecha DATE,
    eliminado BOOLEAN,
    FOREIGN KEY (IDExpediente) REFERENCES expediente(IDExpediente)
);

CREATE TABLE consulta (
    IDConsulta INT AUTO_INCREMENT PRIMARY KEY,
    IDUsuario INT,
    IDExpediente INT,
    fecha DATE,
    FOREIGN KEY (IDUsuario) REFERENCES usuario(IDUsuario),
    FOREIGN KEY (IDExpediente) REFERENCES expediente(IDExpediente)
);

CREATE TABLE usuarioRol (
    IDUsuarioRol INT PRIMARY KEY,
    IDUsuario INT,
    IDRol INT,
    FOREIGN KEY (IDUsuario) REFERENCES usuario(IDUsuario),
    FOREIGN KEY (IDRol) REFERENCES rol(IDRol)
);

CREATE TABLE rolPrivilegios (
    IDRolPrivilegio INT AUTO_INCREMENT PRIMARY KEY,
    IDRol INT,
    IDPrivilegio INT,
    FOREIGN KEY (IDRol) REFERENCES rol(IDRol),
    FOREIGN KEY (IDPrivilegio) REFERENCES privilegios(IDPrivilegio)
);

CREATE TABLE boletaMateria (
    IDBoletaMateria INT AUTO_INCREMENT PRIMARY KEY,
    IDBoleta INT,
    IDMateria INT,
    calificacion DECIMAL(5,2),
    FOREIGN KEY (IDBoleta) REFERENCES boleta(IDBoleta),
    FOREIGN KEY (IDMateria) REFERENCES materia(IDMateria)
);


CREATE TABLE objetivos (
    IDObjetivo INT AUTO_INCREMENT PRIMARY KEY,
<<<<<<< HEAD
    IDSeguimiento INT,
=======
    IDExpediente INT,
>>>>>>> develop
    objetivo VARCHAR(100),
    actividad VARCHAR(100),
    tiempo VARCHAR(20),
    metodologia VARCHAR(100),
    observaciones TEXT,
    eliminado BOOLEAN,
    FOREIGN KEY (IDExpediente) REFERENCES expediente(IDExpediente)
);

CREATE TABLE seguimientoPsicologico (
    IDSeguimiento INT AUTO_INCREMENT PRIMARY KEY,
    IDExpediente INT,
    sesionObjetivo TEXT,
    sesionJustificacion TEXT,
    analisisPsicologico TEXT,
    recomendaciones TEXT,
    sesionBitacora TEXT,
    eliminado BOOLEAN,
    FOREIGN KEY (IDExpediente) REFERENCES expediente(IDExpediente)
);

CREATE TABLE nutricional1 (
    IDNutricional1 INT AUTO_INCREMENT PRIMARY KEY,
    IDExpediente INT,
    sesion VARCHAR(50),
    fecha DATE,
    diabetes VARCHAR(20),
    cancer VARCHAR(20),
    dislipidemia VARCHAR(20),
    obesidad VARCHAR(20),
    anemia VARCHAR(20),
    hipertensionArterial VARCHAR(20),
    pesoNacer DECIMAL(5,2),
    tallaNacer DECIMAL(5,2),
    alimentacionRecibida TEXT,
    sdg VARCHAR(10),
    tipoParto VARCHAR(20),
    complicaciones TEXT,
    lactancia VARCHAR(20),
    tiempo VARCHAR(20),
    edadAlimentacionComplementaria VARCHAR(20),
    alimentosPrimerAnio TEXT,
    eliminado BOOLEAN,
    FOREIGN KEY (IDExpediente) REFERENCES expediente(IDExpediente)
);

CREATE TABLE transtornos (
    IDTranstornos INT AUTO_INCREMENT PRIMARY KEY,
    IDExpediente INT,
    reflujo VARCHAR(20),
    vomito VARCHAR(20),
    disfagia VARCHAR(20),
    diarrea VARCHAR(20),
    flatulencias VARCHAR(20),
    estrenimiento VARCHAR(20),
    distencion VARCHAR(20),
    colitis VARCHAR(20),
    pirosis VARCHAR(20),
    gastritis VARCHAR(20),
    otro TEXT,
    eliminado BOOLEAN,
    FOREIGN KEY (IDExpediente) REFERENCES expediente(IDExpediente)
);

CREATE TABLE indicadoresClinicos (
    IDIndicadorClinico INT AUTO_INCREMENT PRIMARY KEY,
    IDExpediente INT,
    cabello VARCHAR(30),
    dientes VARCHAR(30),
    piel VARCHAR(30),
    unias VARCHAR(30),
    conjunto VARCHAR(30),
    boca VARCHAR(30),
    edema VARCHAR(30),
    eliminado BOOLEAN,
    FOREIGN KEY (IDExpediente) REFERENCES expediente(IDExpediente)
);

CREATE TABLE actividadDiaria (
    IDActividadDiaria INT AUTO_INCREMENT PRIMARY KEY,
    IDExpediente INT,
    ejercicioFisico VARCHAR(100),
    fechaInicio DATE,
    frecuencia VARCHAR(30),
    eliminado BOOLEAN,
    FOREIGN KEY (IDExpediente) REFERENCES expediente(IDExpediente)
);

CREATE TABLE evaluacionAntropometrica (
    IDEvaluacionAntropometrica INT AUTO_INCREMENT PRIMARY KEY,
    IDExpediente INT,
    talla DECIMAL(5,2),
    edad INT,
    peso DECIMAL(5,2),
    pesoIdeal DECIMAL(5,2),
    imc DECIMAL(5,2),
    eliminado BOOLEAN,
    FOREIGN KEY (IDExpediente) REFERENCES expediente(IDExpediente)
);

CREATE TABLE objetivoNutricional (
    IDObjetivoNutricional INT AUTO_INCREMENT PRIMARY KEY,
    IDExpediente INT,
    objetivo TEXT,
    eliminado BOOLEAN,
    FOREIGN KEY (IDExpediente) REFERENCES expediente(IDExpediente)
);

CREATE TABLE diagnosticoEvolucion (
    IDDiagnosticoEvolucion INT AUTO_INCREMENT PRIMARY KEY,
    IDExpediente INT,
    diagnosticoEvolucion TEXT,
    eliminado BOOLEAN,
    FOREIGN KEY (IDExpediente) REFERENCES expediente(IDExpediente)
);

CREATE TABLE manejoNutricional (
    IDManejoNutricional INT AUTO_INCREMENT PRIMARY KEY,
    IDExpediente INT,
    energia VARCHAR(50),
    hidratosDeCarbono VARCHAR(50),
    lipidos VARCHAR(50),
    proteinas VARCHAR(50),
    fibra VARCHAR(50),
    agua VARCHAR(50),
    eliminado BOOLEAN,
    FOREIGN KEY (IDExpediente) REFERENCES expediente(IDExpediente)
);

CREATE TABLE indicadoresBioquim (
    IDIndicadoresBioquim INT AUTO_INCREMENT PRIMARY KEY,
    IDExpediente INT,
    parametro VARCHAR(50),
    valorReferencia VARCHAR(50),
    parametroFecha DATE,
    eliminado BOOLEAN,
    FOREIGN KEY (IDExpediente) REFERENCES expediente(IDExpediente)
);

CREATE TABLE datosGenerales (
    IDDatosGenerales INT AUTO_INCREMENT PRIMARY KEY,
    IDExpediente INT,
    NoSesion VARCHAR(10),
    fecha DATE,
    nombrePreferido VARCHAR(50),
    hermanos INT,
    hermanas INT,
    ocupacionPapa VARCHAR(100),
    trabajoMama VARCHAR(100),
    habitantes INT,
    porQueEstasAqui TEXT,
    eliminado BOOLEAN,
    FOREIGN KEY (IDExpediente) REFERENCES expediente(IDExpediente)
);

CREATE TABLE contextoEscolar (
    IDContextoEscolar INT AUTO_INCREMENT PRIMARY KEY,
    IDExpediente INT,
    NoSesion VARCHAR(10),
    fecha DATE,
    tareasPorGusto TEXT,
    tareasFavoritas TEXT,
    tareasLugar TEXT,
    tareaAyuda TEXT,
    tareaRevisar TEXT,
    tareaQuienRevisa TEXT,
    eliminado BOOLEAN,
    FOREIGN KEY (IDExpediente) REFERENCES expediente(IDExpediente)
);

CREATE TABLE pscicomotricidad (
    IDPscicomotricidad INT AUTO_INCREMENT PRIMARY KEY,
    IDExpediente INT,
    NoSesion VARCHAR(10),
    fecha DATE,
    problema TEXT,
    problemaEduFis TEXT,
    cualesEduFis TEXT,
    deporte TEXT,
    cualDeporte TEXT,
    horasDeporte VARCHAR(20),
    conQuien TEXT,
    gustaDibujar TEXT,
    eliminado BOOLEAN,
    FOREIGN KEY (IDExpediente) REFERENCES expediente(IDExpediente)
);

CREATE TABLE conductual (
    IDConductual INT AUTO_INCREMENT PRIMARY KEY,
    IDExpediente INT,
    NoSesion VARCHAR(10),
    fecha DATE,
    dormirHora VARCHAR(20),
    dormirQuien TEXT,
    dormirNecesidad TEXT,
    dormirMiedo TEXT,
    desayunoHora VARCHAR(20),
    cenaHora VARCHAR(20),
    comerAntesEscuela TEXT,
    alimentosFavoritos TEXT,
    alimentosExceso TEXT,
    alimentosExcesoFrecuencia TEXT,
    celularVideojuegos TEXT,
    videojuegosLugar TEXT,
    videojuegosHora VARCHAR(20),
    videojuegosGenero TEXT,
    maquinitas TEXT,
    maquinitasTiempo VARCHAR(20),
    maquinitasDinero VARCHAR(20),
    computadoraCasa TEXT,
    computadoraLugar TEXT,
    computadoraCompartir TEXT,
    internetCasa TEXT,
    internetTiempo VARCHAR(20),
    cibercafe TEXT,
    cibercafeTiempo VARCHAR(20),
    cibercafeDinero VARCHAR(20),
    computadoraActividades TEXT,
    deporte TEXT,
    deporteHoras VARCHAR(20),
    deporteCompañero TEXT,
    trabajas TEXT,
    trabajo TEXT,
    trabajoDondeRazon TEXT,
    finDeSemana TEXT,
    finDeSemanaIdeal TEXT,
    revistas TEXT,
    eliminado BOOLEAN,
    FOREIGN KEY (IDExpediente) REFERENCES expediente(IDExpediente)
);

CREATE TABLE socioafectivo (
    IDSocioafectivo INT AUTO_INCREMENT PRIMARY KEY,
    IDExpediente INT,
    NoSesion VARCHAR(10),
    fecha DATE,
    amigosEscuela TEXT,
    amigosEscuelaRelacion TEXT,
    amigosCasa TEXT,
    amigosCasaRelacion TEXT,
    mejorAmigo TEXT,
    mejorAmigoRazon TEXT,
    mejorAmiga TEXT,
    mejorAmigaRazon TEXT,
    amigosJuegos TEXT,
    soloJuegos TEXT,
    casaAcciones TEXT,
    ratosLibres TEXT,
    actividadFavorita TEXT,
    fiesta TEXT,
    fiestaRazon TEXT,
    soloRazon TEXT,
    yoAgradar TEXT,
    yoDesagrado TEXT,
    atractivo TEXT,
    atractivoRazon TEXT,
    ser TEXT,
    cambiar TEXT,
    cambiarRazon TEXT,
    animales TEXT,
    animalesCuales TEXT,
    eliminado BOOLEAN,
    FOREIGN KEY (IDExpediente) REFERENCES expediente(IDExpediente)
);

CREATE TABLE familiares (
    IDFamiliares INT AUTO_INCREMENT PRIMARY KEY,
    IDExpediente INT,
    NoSesion VARCHAR(10),
    fecha DATE,
    mama TEXT,
    mamaRazon TEXT,
    papa TEXT,
    papaRazon TEXT,
    padresJuego TEXT,
    padresJuegoRazon TEXT,
    mamaQuiere TEXT,
    mamaQuiereRazon TEXT,
    papaQuiere TEXT,
    papaQuiereRazon TEXT,
    quierenMas TEXT,
    quierenMasRazon TEXT,
    padresHermanos TEXT,
    padresDiscusion TEXT,
    padresDiscusionCuando TEXT,
    padresJuntos TEXT,
    padresCompras TEXT,
    mamaPortarMal TEXT,
    papaPortarMal TEXT,
    consentido TEXT,
    hermanosRelacion TEXT,
    familiaPasear TEXT,
    familiaPasearFrecuencia VARCHAR(50),
    familiaPasearDonde TEXT,
    salirPermiso TEXT,
    salirRazon TEXT,
    travesuras TEXT,
    hermanosTrato TEXT,
    hermanosPelea TEXT,
    hermanosPeleaRazon TEXT,
    hermanosMejor TEXT,
    hermanosMejorRazon TEXT,
    casaIdeal TEXT,
    problemasApoyo TEXT,
    casaEnojon TEXT,
    familiaCambiar TEXT,
    familiaCambiarRazon TEXT,
    eliminado BOOLEAN,
    FOREIGN KEY (IDExpediente) REFERENCES expediente(IDExpediente)
);

CREATE TABLE psicosexual (
    IDPsicosexual INT AUTO_INCREMENT PRIMARY KEY,
    IDExpediente INT,
    NoSesion VARCHAR(10),
    fecha DATE,
    convivir TEXT,
    convivirRazon TEXT,
    convivirMoral TEXT,
    convivirMoralRazon TEXT,
    serNinioa TEXT,
    serNinioaRazon TEXT,
    hacerNinios TEXT,
    hacerNiniosRazon TEXT,
    amor TEXT,
    observacionesPsicosex TEXT,
    eliminado BOOLEAN,
    FOREIGN KEY (IDExpediente) REFERENCES expediente(IDExpediente)
);