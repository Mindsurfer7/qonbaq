import 'package:dartz/dartz.dart';
import '../../core/error/failures.dart';
import '../../core/usecase/usecase.dart';
import '../entities/auth_user.dart';
import '../repositories/auth_repository.dart';

/// Параметры для входа
class LoginParams {
  final String email;
  final String password;

  LoginParams({required this.email, required this.password});
}

/// Use Case для входа пользователя
class LoginUser implements UseCase<AuthUser, LoginParams> {
  final AuthRepository repository;

  LoginUser(this.repository);

  @override
  Future<Either<Failure, AuthUser>> call(LoginParams params) async {
    return await repository.login(
      email: params.email,
      password: params.password,
    );
  }
}
