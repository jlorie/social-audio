import ElementUserModel from '../commons/resources/element-user-model';
import { SUCCESS } from '../commons/constants';

const URI_ELEMENTS_BY_USERS = process.env.URI_ELEMENTS_BY_USERS;
const elementsByUserModel = new ElementUserModel(URI_ELEMENTS_BY_USERS);

export function updateFavoriteStatus(elementId, userId, isFav) {
  console.info(`Marking elem ${elementId} for user ${userId} as ${!isFav ? ' not ' : ''} favorite`);
  let favoriteData = {
    favorite: isFav
  };

  return elementsByUserModel.update(elementId, userId, favoriteData)
    .then(() => SUCCESS);
}
