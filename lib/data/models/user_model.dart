import '../../domain/entities/user.dart';
import '../models/model.dart';

/// Модель пользователя для работы с данными
/// Расширяет доменную сущность User
class UserModel extends User implements Model {
  const UserModel({
    required super.id,
    required super.name,
    required super.email,
  });

  /// Создание модели из JSON
  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
    );
  }

  /// Преобразование модели в доменную сущность
  User toEntity() {
    return User(id: id, name: name, email: email);
  }

  /// Преобразование модели в JSON
  @override
  Map<String, dynamic> toJson() {
    return {'id': id, 'name': name, 'email': email};
  }

  /// Создание модели из доменной сущности
  factory UserModel.fromEntity(User user) {
    return UserModel(id: user.id, name: user.name, email: user.email);
  }
}
