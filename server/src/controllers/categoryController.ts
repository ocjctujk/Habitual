import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Category } from '../entities/Category';

const categoryRepository = AppDataSource.getRepository(Category);

export const createCategory = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { name, icon_url } = req.body;

        if (!name) {
            res.status(400).json({ message: 'Category name is required' });
            return;
        }

        const category = categoryRepository.create({
            name,
            icon_url,
        });

        await categoryRepository.save(category);

        res.status(201).json({
            message: 'Category created successfully',
            category,
        });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getAllCategories = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const categories = await categoryRepository.find({
            relations: ['habits'],
        });

        res.status(200).json(categories);
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getCategoryById = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;

        const category = await categoryRepository.findOne({
            where: { category_id: id },
            relations: ['habits'],
        });

        if (!category) {
            res.status(404).json({ message: 'Category not found' });
            return;
        }

        res.status(200).json(category);
    } catch (error) {
        console.error('Get category error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateCategory = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, icon_url } = req.body;

        const category = await categoryRepository.findOne({
            where: { category_id: id },
        });

        if (!category) {
            res.status(404).json({ message: 'Category not found' });
            return;
        }

        if (name) category.name = name;
        if (icon_url !== undefined) category.icon_url = icon_url;

        await categoryRepository.save(category);

        res.status(200).json({
            message: 'Category updated successfully',
            category,
        });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteCategory = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;

        const result = await categoryRepository.delete(id);

        if (result.affected === 0) {
            res.status(404).json({ message: 'Category not found' });
            return;
        }

        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
