const Pizza = require("../models/pizzaModel");
const addPizza = async (req, res) => {
  const { name, description, price, image } = req.body;
  try {
    const pizza = await Pizza.create({
      name,
      description,
      price,
      image,
    });

    return res.status(201).json({
      message: "Pizza added successfully",
      pizza,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.name,
      message: error.message,
    });
  }
};

const getPizza = async (req, res) => {
  try {
    const pizza = await Pizza.find();
    if (!pizza) {
      return res.status(404).json({
        message: "No pizza exists.",
      });
    }
    return res.status(201).json({
      pizza,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.name,
      message: error.message,
    });
  }
};
module.exports = { addPizza, getPizza };
