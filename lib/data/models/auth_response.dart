import '../../domain/entities/auth_user.dart';
import '../models/model.dart';

/// Модель ответа аутентификации
class AuthResponse implements Model {
  final AuthUserModel user;
  final String accessToken;
  final String refreshToken;

  AuthResponse({
    required this.user,
    required this.accessToken,
    required this.refreshToken,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      user: AuthUserModel.fromJson(json['user'] as Map<String, dynamic>),
      accessToken: json['accessToken'] as String,
      refreshToken: json['refreshToken'] as String,
    );
  }

  @override
  Map<String, dynamic> toJson() {
    return {
      'user': user.toJson(),
      'accessToken': accessToken,
      'refreshToken': refreshToken,
    };
  }

  /// Преобразование в доменную сущность пользователя
  AuthUser toUserEntity() {
    return user.toEntity();
  }
}

/// Модель пользователя в ответе аутентификации
class AuthUserModel implements Model {
  final String id;
  final String email;
  final String username;
  final bool isAdmin;

  AuthUserModel({
    required this.id,
    required this.email,
    required this.username,
    required this.isAdmin,
  });

  factory AuthUserModel.fromJson(Map<String, dynamic> json) {
    return AuthUserModel(
      id: json['id'] as String,
      email: json['email'] as String,
      username: json['username'] as String,
      isAdmin: json['isAdmin'] as bool? ?? false,
    );
  }

  @override
  Map<String, dynamic> toJson() {
    return {'id': id, 'email': email, 'username': username, 'isAdmin': isAdmin};
  }

  /// Преобразование в доменную сущность
  AuthUser toEntity() {
    return AuthUser(id: id, email: email, username: username, isAdmin: isAdmin);
  }
}
