import Category from '../Models/productCategoryModel.js';
import mongoose from 'mongoose';

// Create Category
const createCategory = async (req, res) => {
  try {
    const { name, description, parentCategory } = req.body;
    const category = new Category({ name, description, parentCategory });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getChildCategories = async (parentId) => {
  const categories = await Category.find({ parentCategory: parentId });
  const childCategories = [];

  for (let category of categories) {
    const children = await getChildCategories(category._id);
    childCategories.push({
      category,
      children,
    });
  }

  return childCategories;
};

const getAllChildCategories = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: 'Invalid category ID' });
  }

  try {
    const rootCategory = await Category.findById(id);
    if (!rootCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const childCategories = await getChildCategories(id);

    res.status(200).json({
      rootCategory,
      childCategories,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteChildCategories = async (parentId) => {
  const childCategories = await Category.find({ parentCategory: parentId });
  for (let child of childCategories) {
    await deleteChildCategories(child._id); // Recursively delete child categories
  }
  await Category.deleteMany({ parentCategory: parentId }); // Delete the direct child categories
};

const deleteCategoryAndChildren = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: 'Invalid category ID' });
  }

  try {
    // First delete all child categories recursively
    await deleteChildCategories(id);

    // Finally delete the parent category
    const deletedCategory = await Category.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({ message: 'Category and its children deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate({
      path: 'parentCategory',
      populate: {
        path: 'parentCategory',
        populate: {
          path: 'parentCategory', // Continue this pattern for more levels of nesting
        },
      },
    });
    res.status(200).json(categories);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update Category
const updateCategory = async (req, res) => {

  const id = req.params.id;
  const { name, description, parentCategory } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: 'Invalid category ID' });
  }
  
  try {
    const category = await Category.findByIdAndUpdate(id, { name, description, parentCategory }, { new: true });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


export  { createCategory, getCategories, updateCategory, deleteCategoryAndChildren,getAllChildCategories };
