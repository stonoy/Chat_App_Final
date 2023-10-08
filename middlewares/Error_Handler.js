const Error_Handler = (err, req, res, next) => {
  let customErrMsg = {
    msg: err.message || "something went wrong",
    statusCode: err.statusCode || 500,
  };

  res.status(customErrMsg.statusCode).json({ msg: customErrMsg.msg });
};

export default Error_Handler;
