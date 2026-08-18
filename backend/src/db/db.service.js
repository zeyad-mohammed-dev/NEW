export const findOne = async ({
  model,
  filter = {},
  select = '',
  populate = [],
  sort = {},
}) => {
  return await model.findOne(filter).select(select).populate(populate).sort(sort);
};

export const findById = async ({ model, id, select = '', populate = [] }) => {
  return await model.findById(id).select(select).populate(populate);
};

export const find = async ({
  model,
  filter = {},
  select = '',
  populate = [],
  sort = {},
  skip = 0,
  limit = 0,
}) => {
  let query = model.find(filter).select(select).populate(populate).sort(sort);
  if (skip) query = query.skip(skip);
  if (limit) query = query.limit(limit);
  return await query;
};

export const create = async ({
  model,
  data = [{}],
  options = { validateBeforeSave: true },
}) => {
  const result = await model.create(data, options);
  // Mongoose returns array when data is array; normalize to single doc for single-element arrays
  return Array.isArray(result) && result.length === 1 ? result[0] : result;
};

export const updateOne = async ({
  model,
  filter = {},
  update = {},
  options = { runValidators: true },
}) => {
  return await model.updateOne(filter, update, options);
};

export const findOneAndUpdate = async ({
  model,
  filter = {},
  select = '',
  populate = [],
  data = {},
  options = { runValidators: true, returnDocument: 'after' },
}) => {
  return await model
    .findOneAndUpdate(filter, data, options)
    .select(select)
    .populate(populate);
};

export const deleteOne = async ({ model, filter = {} }) => {
  return await model.deleteOne(filter);
};

export const deleteMany = async ({ model, filter = {} }) => {
  return await model.deleteMany(filter);
};

export const updateMany = async ({ model, filter = {}, data = {}, options = {} }) => {
  return await model.updateMany(filter, data, options);
};

export const countDocuments = async ({ model, filter = {} }) => {
  return await model.countDocuments(filter);
};
