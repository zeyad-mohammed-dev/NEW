export const errorResponse = ({
  res,
  statusCode = 500,
  message = 'Server Error',
  code = 'SERVER_ERROR',
  details = null,
}) => {
  const response = {
    success: false,
    message,
    code,
  };
  if (details) {
    response.details = details;
  }
  return res.status(statusCode).json(response);
};

export const successResponse = ({
  res,
  data = null,
  message = 'Success',
  statusCode = 200,
}) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};