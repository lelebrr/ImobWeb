package com.imobweb.app.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.imobweb.app.data.repository.VistoriaRepository
import com.imobweb.app.ui.home.HomeScreen
import com.imobweb.app.ui.login.LoginScreen
import com.imobweb.app.ui.vistoria.VistoriaDetailScreen
import com.imobweb.app.ui.vistoria.VistoriaListScreen
import com.imobweb.app.ui.vistoria.VistoriaWizardScreen

object Routes {
    const val LOGIN = "login"
    const val HOME = "home"
    const val WIZARD = "wizard"
    const val WIZARD_EDIT = "wizard/{vistoriaId}"
    const val VISTORIA_LIST = "vistorias"
    const val VISTORIA_DETAIL = "vistoria/{vistoriaId}"

    fun wizardEdit(id: Long) = "wizard/$id"
    fun vistoriaDetail(id: Long) = "vistoria/$id"
}

@Composable
fun AppNavGraph(
    navController: NavHostController,
    repository: VistoriaRepository,
    startDestination: String
) {
    NavHost(navController = navController, startDestination = startDestination) {
        composable(Routes.LOGIN) {
            LoginScreen(
                repository = repository,
                onLoginSuccess = {
                    navController.navigate(Routes.HOME) {
                        popUpTo(Routes.LOGIN) { inclusive = true }
                    }
                }
            )
        }

        composable(Routes.HOME) {
            HomeScreen(
                repository = repository,
                onNewVistoria = { navController.navigate(Routes.WIZARD) },
                onViewVistorias = { navController.navigate(Routes.VISTORIA_LIST) }
            )
        }

        composable(Routes.WIZARD) {
            VistoriaWizardScreen(
                repository = repository,
                onBack = { navController.popBackStack() },
                onSaved = { navController.popBackStack() }
            )
        }

        composable(
            route = Routes.WIZARD_EDIT,
            arguments = listOf(navArgument("vistoriaId") { type = NavType.LongType })
        ) { backStackEntry ->
            val id = backStackEntry.arguments?.getLong("vistoriaId") ?: 0L
            VistoriaWizardScreen(
                repository = repository,
                vistoriaId = id,
                onBack = { navController.popBackStack() },
                onSaved = { navController.popBackStack() }
            )
        }

        composable(Routes.VISTORIA_LIST) {
            VistoriaListScreen(
                repository = repository,
                onBack = { navController.popBackStack() },
                onEditVistoria = { id -> navController.navigate(Routes.wizardEdit(id)) },
                onViewVistoria = { id -> navController.navigate(Routes.vistoriaDetail(id)) }
            )
        }

        composable(
            route = Routes.VISTORIA_DETAIL,
            arguments = listOf(navArgument("vistoriaId") { type = NavType.LongType })
        ) { backStackEntry ->
            val id = backStackEntry.arguments?.getLong("vistoriaId") ?: 0L
            VistoriaDetailScreen(
                repository = repository,
                vistoriaId = id,
                onBack = { navController.popBackStack() },
                onEdit = { navController.navigate(Routes.wizardEdit(id)) }
            )
        }
    }
}
