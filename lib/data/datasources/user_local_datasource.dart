import '../datasources/datasource.dart';
import '../models/user_model.dart';

/// Локальный источник данных для пользователей (кэш, база данных)
abstract class UserLocalDataSource extends DataSource {
  /// Получить пользователя из локального хранилища
  Future<UserModel?> getUserById(String id);

  /// Получить всех пользователей из локального хранилища
  Future<List<UserModel>> getAllUsers();

  /// Сохранить пользователя в локальное хранилище
  Future<void> cacheUser(UserModel user);

  /// Сохранить список пользователей в локальное хранилище
  Future<void> cacheUsers(List<UserModel> users);
}
