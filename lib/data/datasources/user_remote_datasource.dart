import '../datasources/datasource.dart';
import '../models/user_model.dart';

/// Удаленный источник данных для пользователей (API)
/// В реальном проекте здесь будут HTTP запросы
abstract class UserRemoteDataSource extends DataSource {
  /// Получить пользователя по ID с сервера
  Future<UserModel> getUserById(String id);

  /// Получить всех пользователей с сервера
  Future<List<UserModel>> getAllUsers();

  /// Создать пользователя на сервере
  Future<UserModel> createUser(UserModel user);
}
