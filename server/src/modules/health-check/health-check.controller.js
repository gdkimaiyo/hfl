class HealthCheckController {
  /**
   * @description Get health status of Application
   */
  static getStatus(req, res, next) {
    res.json({ status: "UP" });
  }
}

export default HealthCheckController;
