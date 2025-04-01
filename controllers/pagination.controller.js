/**
 * @file Controlador genérico para paginación en múltiples vistas y modelos
 * @module controllers/pagination.controller
 */

/**
 * Controlador genérico de paginación
 * @namespace PaginationController
 */
const PaginationController = {
    /**
     * Obtiene datos paginados para cualquier modelo
     * @async
     * @function getPaginatedData
     * @param {Object} Model - Modelo de Mongoose a paginar
     * @param {Object} query - Objeto de consulta para filtrar
     * @param {Object} options - Opciones de paginación y población
     * @param {number} [options.page=1] - Página actual
     * @param {number} [options.perPage=10] - Items por página
     * @param {string} [options.sort='-createdAt'] - Campo para ordenar
     * @param {string|Object} [options.populate] - Campos a popular
     * @return {Promise<Object>} Objeto con datos y metadatos de paginación
     */
    async getPaginatedData(Model, query = {}, options = {}) {
      const {
        page = 1,
        perPage = 10,
        sort = '-createdAt',
        populate = '',
        select = ''
      } = options;
  
      try {
        const [items, totalItems] = await Promise.all([
          Model.find(query)
            .select(select)
            .skip((page - 1) * perPage)
            .limit(perPage)
            .sort(sort)
            .populate(populate)
            .lean(),
          Model.countDocuments(query)
        ]);
  
        const totalPages = Math.ceil(totalItems / perPage);
  
        return {
          items,
          pagination: {
            currentPage: page,
            perPage,
            totalItems,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
          }
        };
      } catch (error) {
        logger.error(`Error en paginación para modelo ${Model.modelName}:`, error);
        throw error;
      }
    },
  
    /**
     * Middleware para paginar cualquier modelo
     * @function paginateResults
     * @param {Object} Model - Modelo de Mongoose
     * @param {Object} [defaultQuery={}] - Consulta por defecto
     * @param {Object} [defaultOptions={}] - Opciones por defecto
     * @return {Function} Middleware de Express
     */
    paginateResults(Model, defaultQuery = {}, defaultOptions = {}) {
      return async (req, res, next) => {
        try {
          const { query = {} } = req;
          const mergedQuery = { ...defaultQuery, ...query };
          
          const options = {
            page: parseInt(req.query.page) || defaultOptions.page || 1,
            perPage: parseInt(req.query.perPage) || defaultOptions.perPage || 10,
            sort: req.query.sort || defaultOptions.sort || '-createdAt',
            populate: req.query.populate || defaultOptions.populate,
            select: req.query.select || defaultOptions.select
          };
  
          const { items, pagination } = await this.getPaginatedData(
            Model,
            mergedQuery,
            options
          );
  
          req.paginatedResults = {
            success: true,
            data: items,
            pagination
          };
  
          next();
        } catch (error) {
          logger.error(`Error en middleware de paginación:`, error);
          res.status(500).json({
            success: false,
            message: `Error al paginar resultados de ${Model.modelName}`
          });
        }
      };
    },
  
    /**
     * Renderiza vista con datos paginados
     * @function renderWithPagination
     * @param {Object} req - Objeto de solicitud Express
     * @param {Object} res - Objeto de respuesta Express
     * @param {String} view - Vista a renderizar
     * @param {Object} [additionalData={}] - Datos adicionales para la vista
     */
    renderWithPagination(req, res, view, additionalData = {}) {
      res.render(view, {
        ...req.paginatedResults,
        ...additionalData
      });
    }
  };
  
  module.exports = PaginationController;