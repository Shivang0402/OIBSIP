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

const getPizzaById = async (req, res) => {
  try {
    const { id } = req.params;
    const pizza = await Pizza.findById(id);
    if (!pizza) {
      return res.status(404).json({
        message: "Pizza does not exist.",
      });
    }
    return res.status(200).json({
      pizza,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.name,
      message: error.message,
    });
  }
};

const updatePizza = async (req, res) => {
  const { name, description, price, image, isAvailable } = req.body;
  const { id } = req.params;
  try {
    const pizza = await Pizza.findById(id);
    if (!pizza) {
      return res.status(404).json({
        success: false,
        message: "Pizza does not exist",
      });
    }

    const updates = { name, description, price, image, isAvailable };
    for (const [field, value] of Object.entries(updates)) {
      if (value !== undefined) {
        pizza[field] = value;
      }
    }
    await pizza.save();

    return res.status(201).json({
      message: "Pizza details updated successfully.",
      pizza,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { addPizza, getPizza, getPizzaById, updatePizza };
