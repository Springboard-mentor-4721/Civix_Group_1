const Petition = require('../models/petition.model');
const Signature = require('../models/signature.model');

class PetitionService {
  async create(userId, petitionData) {
    const { title, description, category, tags, targetSignatures, location, status, mediaUrls } = petitionData;

    const petition = await Petition.create({
      title,
      description,
      category,
      tags: Array.isArray(tags) ? tags : [],
      targetSignatures: targetSignatures || 100,
      location,
      creator: userId,
      status: status || 'active',
      mediaUrls: Array.isArray(mediaUrls) ? mediaUrls : []
    });

    return await petition.populate('creator', 'name email role location');
  }

  async findAll(queryParams = {}, userId = null) {
    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = {};
    filter.status = queryParams.status ? queryParams.status : 'active';
    if (queryParams.category) filter.category = queryParams.category;
    if (queryParams.city) filter['location.city'] = new RegExp(queryParams.city.trim(), 'i');
    if (queryParams.state) filter['location.state'] = new RegExp(queryParams.state.trim(), 'i');
    if (queryParams.tag) filter.tags = queryParams.tag.trim().toLowerCase();

    if (queryParams.search && queryParams.search.trim()) {
      const searchRegex = new RegExp(queryParams.search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } }
      ];
    }

    const sortBy = queryParams.sortBy || 'createdAt';
    const order = queryParams.order === 'asc' ? 1 : -1;
    const sort = { [sortBy]: order };

    const [petitions, total] = await Promise.all([
      Petition.find(filter).sort(sort).skip(skip).limit(limit).populate('creator', 'name email role location'),
      Petition.countDocuments(filter)
    ]);

    let signedPetitionIds = new Set();
    if (userId && petitions.length > 0) {
      const petitionIds = petitions.map((p) => p._id);
      const userSignatures = await Signature.find({
        user: userId,
        petition: { $in: petitionIds }
      }).select('petition');
      signedPetitionIds = new Set(userSignatures.map((s) => s.petition.toString()));
    }

    const petitionsWithSigned = petitions.map((p) => {
      const doc = p.toObject ? p.toObject() : p;
      return {
        ...doc,
        hasSigned: userId ? signedPetitionIds.has(p._id.toString()) : false
      };
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      petitions: petitionsWithSigned,
      pagination: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 }
    };
  }

  async findByUser(userId, queryParams = {}) {
    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = { creator: userId };
    if (queryParams.status) filter.status = queryParams.status;
    if (queryParams.category) filter.category = queryParams.category;

    const sortBy = queryParams.sortBy || 'createdAt';
    const order = queryParams.order === 'asc' ? 1 : -1;
    const sort = { [sortBy]: order };

    const [petitions, total] = await Promise.all([
      Petition.find(filter).sort(sort).skip(skip).limit(limit).populate('creator', 'name email role location'),
      Petition.countDocuments(filter)
    ]);

    let signedPetitionIds = new Set();
    if (userId && petitions.length > 0) {
      const petitionIds = petitions.map((p) => p._id);
      const userSignatures = await Signature.find({
        user: userId,
        petition: { $in: petitionIds }
      }).select('petition');
      signedPetitionIds = new Set(userSignatures.map((s) => s.petition.toString()));
    }

    const petitionsWithSigned = petitions.map((p) => {
      const doc = p.toObject ? p.toObject() : p;
      return {
        ...doc,
        hasSigned: signedPetitionIds.has(p._id.toString())
      };
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      petitions: petitionsWithSigned,
      pagination: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 }
    };
  }

  async findSignedByUser(userId, queryParams = {}) {
    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const signatures = await Signature.find({ user: userId }).select('petition');
    const petitionIds = signatures.map((s) => s.petition);

    if (petitionIds.length === 0) {
      return {
        petitions: [],
        pagination: { total: 0, page, limit, totalPages: 1, hasNextPage: false, hasPrevPage: false }
      };
    }

    const filter = { _id: { $in: petitionIds } };
    if (queryParams.status && queryParams.status !== 'All') {
      filter.status = queryParams.status;
    }
    if (queryParams.category && queryParams.category !== 'All Categories') {
      filter.category = queryParams.category;
    }
    if (queryParams.city) {
      filter['location.city'] = new RegExp(queryParams.city.trim(), 'i');
    }
    if (queryParams.state && queryParams.state !== 'All Locations') {
      filter['location.state'] = new RegExp(queryParams.state.trim(), 'i');
    }
    if (queryParams.tag) {
      filter.tags = queryParams.tag.trim().toLowerCase();
    }

    if (queryParams.search && queryParams.search.trim()) {
      const searchRegex = new RegExp(queryParams.search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } }
      ];
    }

    const sortBy = queryParams.sortBy || 'createdAt';
    const order = queryParams.order === 'asc' ? 1 : -1;
    const sort = { [sortBy]: order };

    const [petitions, total] = await Promise.all([
      Petition.find(filter).sort(sort).skip(skip).limit(limit).populate('creator', 'name email role location'),
      Petition.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    const petitionsWithSigned = petitions.map((p) => {
      const doc = p.toObject ? p.toObject() : p;
      return {
        ...doc,
        hasSigned: true
      };
    });

    return {
      petitions: petitionsWithSigned,
      pagination: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 }
    };
  }

  async findById(petitionId, userId = null) {
    const petition = await Petition.findById(petitionId).populate('creator', 'name email role location');
    if (!petition) {
      const error = new Error('Petition not found');
      error.statusCode = 404;
      throw error;
    }

    let hasSigned = false;
    if (userId) {
      const signature = await Signature.findOne({ petition: petitionId, user: userId });
      hasSigned = Boolean(signature);
    }

    const doc = petition.toObject ? petition.toObject() : petition;
    return {
      ...doc,
      hasSigned
    };
  }

  async updateStatus(petitionId, newStatus) {
    const petition = await Petition.findById(petitionId);

    if (!petition) {
      const error = new Error('Petition not found');
      error.statusCode = 404;
      throw error;
    }

    // Added 'resolved' for dashboard tracking and removed strict transition blockers
    const supportedStatuses = ['active', 'under_review', 'resolved', 'closed'];
    if (!supportedStatuses.includes(newStatus)) {
      const error = new Error(`Invalid petition status. Supported values: ${supportedStatuses.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    petition.status = newStatus;
    await petition.save();

    return await petition.populate('creator', 'name email role location');
  }

  async update(petitionId, userId, updateData) {
    const petition = await Petition.findById(petitionId);
    if (!petition) {
      const error = new Error('Petition not found');
      error.statusCode = 404;
      throw error;
    }

    if (petition.creator.toString() !== userId.toString()) {
      const error = new Error('You are not authorized to modify this petition');
      error.statusCode = 403;
      throw error;
    }

    if (petition.signaturesCount > 0) {
      const error = new Error('Cannot edit a petition that has already received signatures');
      error.statusCode = 400;
      throw error;
    }

    const allowedFields = ['title', 'description', 'category', 'tags', 'targetSignatures', 'location', 'status', 'mediaUrls'];
    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        petition[field] = updateData[field];
      }
    });

    await petition.save();
    return await petition.populate('creator', 'name email role location');
  }

  async delete(petitionId, userId) {
    const error = new Error('Petitions cannot be deleted once created to preserve civic accountability and public record');
    error.statusCode = 403;
    throw error;
  }

  async signPetition(petitionId, userId) {
    const petition = await Petition.findById(petitionId);
    if (!petition) {
      const error = new Error('Petition not found');
      error.statusCode = 404;
      throw error;
    }

    if (petition.status === 'closed') {
      const error = new Error('Cannot sign a closed petition');
      error.statusCode = 400;
      throw error;
    }

    if (petition.status !== 'active') {
      const error = new Error('Cannot sign a petition that is not active');
      error.statusCode = 400;
      throw error;
    }

    const existingSignature = await Signature.findOne({ petition: petitionId, user: userId });
    if (existingSignature) {
      const error = new Error('You have already signed this petition');
      error.statusCode = 400;
      throw error;
    }

    try {
      await Signature.create({ petition: petitionId, user: userId });
    } catch (err) {
      if (err.code === 11000) {
        const error = new Error('You have already signed this petition');
        error.statusCode = 400;
        throw error;
      }
      throw err;
    }

    const updatedPetition = await Petition.findByIdAndUpdate(
      petitionId,
      { $inc: { signaturesCount: 1 } },
      { new: true }
    );

    return {
      petitionId: updatedPetition._id,
      signaturesCount: updatedPetition.signaturesCount
    };
  }
}

module.exports = new PetitionService();