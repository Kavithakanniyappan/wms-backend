import authService from "../../services/auth/index.js";

const authController = {

  // 🔹 SIGNUP
  async signup(req, res) {
    try {
      const result = await authService.signup(req.body);

      if (result.error) {
        return res.status(400).json({
          status: "error",
          message: result.error
        });
      }

      return res.status(201).json({
        status: "success",
        message: result.success
      });

    } catch (err) {
      return res.status(500).json({
        status: "error",
        message: err.message
      });
    }
  },

  // 🔹 SIGNIN
  async signin(req, res) {
    try {
      const result = await authService.signin(req.body);

      if (result.error) {
        return res.status(400).json({
          status: "error",
          message: result.error
        });
      }

      return res.status(200).json({
        status: "success",
        message: result.success,
        token: result.token,
        user: result.user
      });

    } catch (err) {
      return res.status(500).json({
        status: "error",
        message: err.message
      });
    }
  }

};

export default authController;