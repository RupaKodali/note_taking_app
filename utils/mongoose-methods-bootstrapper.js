class ModelMethods {
  constructor(Model, tableName) {
    this.Model = Model;
    this.tableName = tableName;
  }

  // Function to handle MongoDB-specific error types
  handleMongoError = async (error) => {
    switch (error.name) {
      case 'ValidationError':
        console.error(`Validation error: ${error.message}`);
        break;
      case 'CastError':
        console.error(`Cast error: ${error.message}`);
        break;
      case 'MongoError':
        console.error(`MongoDB error: ${error.message}`);
        break;
      case 'DocumentNotFoundError':
        console.error(`Document not found: ${error.message}`);
        break;
      case 'QueryError':
        console.error(`Query error: ${error.message}`);
        break;
      default:
        console.error(`General error: ${error.message}`);
    }
  }

  // Function to find documents based on a query
  find = async (query = {}) => {
    try {
      // Use the model associated with this.Model to find documents that match the query
      const result = await this.Model.find(query);

      if (!result || result.length === 0) {
        // console.log('No documents found for the provided query.');
        return false;
      }

      return result[0];
    } catch (error) {
      this.handleMongoError(error);
      throw error;
    }
  }

  // Function to find documents based on a query
  findAll = async (query = {}) => {
    try {
      // Use the model associated with this.Model to find documents that match the query
      const result = await this.Model.find(query).sort({ 'cd': -1 });

      if (!result || result.length === 0) {
        // console.log('No documents found for the provided query.');
        return result;
      }

      return result;
    } catch (error) {
      this.handleMongoError(error);
      throw error;
    }
  }

  // Function to paginate through results using mongoose-paginate-v2
  paginate = async (query = {}, page = 1, pageSize = 10) => {
    try {
      // Use the model associated with this.Model and the mongoose-paginate-v2 plugin for paginating
      const options = {
        page: page,
        limit: pageSize,
      };

      const result = await this.Model.paginate(query, options);

      if (result.docs.length === 0) {
        // console.log('No documents found for the provided query.');
      }
      const { docs, totalDocs, totalPages } = result;

      // Return both the paginated documents and pagination information
      return {
        data: docs,
        pagination: {
          perPage: pageSize, // Use pageSize instead of limit
          pageNo: page,
          totalDocs: totalDocs,
          total_pages: totalPages,
        },
      };
    } catch (error) {
      this.handleMongoError(error);
      throw error;
    }
  }

  // Function to create a new document
  create = async (data) => {
    try {
      // Use this.Model to create a new document
      const result = await this.Model.create(data);
      return result;
    } catch (error) {
      this.handleMongoError(error);
      throw error;
    }
  }

  // Function to update multiple documents based on a query
  update = async (query, data) => {
    try {
      // Use this.Model to update multiple documents
      const result = await this.Model.updateMany(query, data);
      return result;
    } catch (error) {
      this.handleMongoError(error);
      throw error;
    }
  }

  // Function to upsert (update or insert) a document based on a query
  upsert = async (query, data) => {
    try {
      // Use this.Model to upsert a document
      const result = await this.Model.updateOne(query, data, { upsert: true });
      return result;
    } catch (error) {
      this.handleMongoError(error);
      throw error;
    }
  }

  // Function to soft delete a document by setting a flag and adding a deletedAt timestamp
  softDelete = async (query) => {
    try {
      // Set the flag 'isDeleted' to true and add a 'deletedAt' timestamp
      const update = {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      };

      // Use this.Model to soft delete documents based on the query
      const result = await this.Model.updateMany(query, update);

      return result;
    } catch (error) {
      this.handleMongoError(error);
      throw error;
    }
  }
}

module.exports = ModelMethods;


// pagination({ find, options }, pageNo, perPage) {
//   pageNo = pageNo || 1;
//   perPage = perPage || 10;
//   return this.Model.paginate(find, Object.assign({ "lean": true, page: pageNo, limit: perPage }, options))
//     .then((response) => {
//       let object = {};
//       object["data"] = response.docs;
//       object["pagination"] = {};
//       object["pagination"]["total_pages"] = Math.ceil(response.totalDocs / perPage);
//       object["pagination"]["per_page"] = perPage;
//       object["pagination"]["current_page"] = pageNo;
//       object["pagination"]["next_page"] =
//         response.total == 0 || object["pagination"]["total_pages"] == pageNo ? 0 : parseInt(pageNo) + 1;
//       object["pagination"]["previous_page"] = pageNo == 1 ? 0 : parseInt(pageNo) - 1;
//       object["pagination"]["total_rows"] = response.totalDocs;
//       return object;
//     })
//     .catch((e) => {
//       console.error(e);
//       let error = new Error();
//       error.name = "PAGINATION_ERROR";
//       error.lineNumber = 118;
//       throw error;
//     });
// }

