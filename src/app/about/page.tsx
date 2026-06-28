"use client";

import Link from "next/link";
import { PageTitle } from "@/components/shared/page-title";
import { Button } from "@/components/shared/button";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { PAGES } from "@/utils/constants";
import { useI18n } from "@/i18n/provider";
import styles from "./page.module.scss";

export default function AboutPage() {
	const { locale, t } = useI18n();
	const en = locale === "en";

	return (
		<div className={styles.page}>
			<div className={styles.inner}>
				<nav className={styles.nav}>
					<Button href={PAGES.HOME} variant="outline" color="neutral" size="md">
						← {en ? "Home" : "Главная"}
					</Button>
					<Button
						href={PAGES.LOGIN}
						variant="outline"
						color="primary"
						size="md"
					>
						{en ? "Start" : "Начать"} →
					</Button>
					<LanguageSwitcher className={styles.langSwitcher} />
				</nav>

				<PageTitle
					label={en ? "How it works" : "Как это работает"}
					title={en ? "Rules" : "Правила"}
				/>

				<div className={styles.intro}>
					<p className={styles.introText}>
						{en
							? "4friends is a platform for competitions with friends. Predict FIFA World Cup 2026 match scores, earn points, and compete inside your room. You decide on the prize pool — we keep the scoring fair and on time."
							: "4friends — платформа для соревнований с друзьями. Делайте прогнозы на матчи ЧМ-2026, зарабатывайте очки и соревнуйтесь в своей комнате. Вы сами решаете, какой будет призовой фонд — мы следим за тем, чтобы результаты считались честно и вовремя."}
					</p>
				</div>

				<div className={styles.sections}>
					{/* ───────── HOME ───────── */}
					<section className={styles.section} id="home">
						<h2 className={styles.sectionTitle}>{en ? "Home" : "Главная"}</h2>

						<p className={styles.sectionText}>
							{en
								? 'The home page is where you place your bets. The "Next matches" section shows every upcoming match within a 1-week window starting from the kick-off of the next unstarted match — so matches are visible even if the closest one is days away.'
								: 'Главная страница — здесь вы делаете ставки. Секция "Next matches" показывает все ближайшие матчи в интервале 1 недели начиная от старта ближайшего ещё не начавшегося матча — то есть матчи видны, даже если до них ещё несколько дней.'}
						</p>
						<p className={styles.sectionText}>
							{en
								? "Bets are locked the moment a match kicks off — after that you can no longer create, edit or delete them."
								: "Ставки блокируются в момент начала матча — после этого их нельзя ни создать, ни изменить, ни удалить."}
						</p>

						<p className={styles.subTitle}>
							{en ? "Bet card colors" : "Цвета карточки ставки"}
						</p>
						<ul className={styles.statusList}>
							<li className={styles.statusItem}>
								<span className={styles.dot} data-color="grey" />
								{en
									? "Grey — no bet placed yet"
									: "Серый — ставка ещё не сделана"}
							</li>
							<li className={styles.statusItem}>
								<span className={styles.dot} data-color="yellow" />
								{en
									? "Yellow — unsaved changes"
									: "Жёлтый — есть несохранённые изменения"}
							</li>
							<li className={styles.statusItem}>
								<span className={styles.dot} data-color="green" />
								{en ? "Green — bet saved" : "Зелёный — ставка сохранена"}
							</li>
							<li className={styles.statusItem}>
								<span className={styles.dot} data-color="red" />
								{en
									? "Red — validation error (fix before saving)"
									: "Красный — ошибка валидации (нужно исправить перед сохранением)"}
							</li>
						</ul>

						<p className={styles.subTitle}>
							{en ? "Group-stage matches" : "Групповые матчи"}
						</p>
						<p className={styles.sectionText}>
							{en
								? "Enter the predicted goals for both teams. That's it — draws are allowed and no winner has to be picked."
								: "Введите количество голов для каждой команды. Всё — ничьи допустимы, выбирать победителя не нужно."}
						</p>

						<p className={styles.subTitle}>
							{en ? "Playoff matches" : "Матчи плей-офф"}
						</p>
						<p className={styles.sectionText}>
							{en
								? "Playoff cards have an extra winner radio. When the predicted score isn't a tie, the winner is selected automatically. For a predicted tie, you must manually pick which team advances — saving without a pick is blocked."
								: "В карточках матчей плей-офф есть дополнительный переключатель победителя. Если предсказанный счёт не ничейный, победитель выбирается автоматически. При прогнозе на ничью вы должны вручную указать, кто проходит дальше — без выбора сохранение блокируется."}
						</p>

						<p className={styles.subTitle}>
							{en ? "Scoring — Group stage" : "Начисление очков — Группа"}
						</p>
						<div className={styles.pointsGrid}>
							<span className={styles.pointsBadge}>3</span>
							<p className={styles.pointsLabel}>
								{en ? "Exact score" : "Точный счёт"}
							</p>
							<span className={styles.pointsBadge}>2</span>
							<p className={styles.pointsLabel}>
								{en
									? "Correct goal difference (but not the exact score)"
									: "Правильная разница голов (но не точный счёт)"}
							</p>
							<span className={styles.pointsBadge}>1</span>
							<p className={styles.pointsLabel}>
								{en
									? "Correct outcome — win, draw or loss"
									: "Правильный исход — победа, ничья или поражение"}
							</p>
							<span className={styles.pointsBadge}>0</span>
							<p className={styles.pointsLabel}>
								{en ? "Incorrect outcome" : "Неверный исход"}
							</p>
						</div>

						<p className={styles.subTitle}>
							{en ? "Scoring — Playoffs" : "Начисление очков — Плей-офф"}
						</p>
						<p className={styles.sectionText}>
							{en
								? "The same 3 / 2 / 1 / 0 scale applies, calculated against the score at the end of regulation time (90 minutes) — extra time and penalties are not used in the base scoring."
								: "Применяется та же шкала 3 / 2 / 1 / 0, считается по счёту на конец основного времени (90 минут) — дополнительное время и пенальти в базовом расчёте не учитываются."}
						</p>
						<p className={styles.sectionText}>
							{en ? (
								<>
									In addition, your winner pick gives a{" "}
									<strong>+2 bonus</strong> if you correctly predicted which
									team advances to the next round.
								</>
							) : (
								<>
									Дополнительно, ваш выбор победителя даёт{" "}
									<strong>+2 бонусных очка</strong>, если вы правильно угадали,
									какая команда проходит в следующий раунд.
								</>
							)}
						</p>
					</section>

					{/* ───────── SCHEDULE ───────── */}
					<section className={styles.section} id="schedule">
						<h2 className={styles.sectionTitle}>
							{en ? "Schedule" : "Расписание"}
						</h2>
						<p className={styles.sectionText}>
							{en
								? "The full tournament schedule with every match grouped by date. Each match card reflects its current status:"
								: "Полное расписание турнира со всеми матчами, сгруппированными по дате. Каждая карточка показывает текущий статус матча:"}
						</p>
						<ul className={styles.statusList}>
							<li className={styles.statusItem}>
								<span className={styles.dot} data-color="grey" />
								{en ? "Grey — not started" : "Серый — не начался"}
							</li>
							<li className={styles.statusItem}>
								<span className={styles.dot} data-color="yellow" />
								{en
									? 'Yellow — live, "In Play" with current minute pulsing'
									: 'Жёлтый — идёт прямо сейчас, "In Play" с пульсирующей минутой'}
							</li>
							<li className={styles.statusItem}>
								<span className={styles.dot} data-color="green" />
								{en ? "Green — finished" : "Зелёный — завершён"}
							</li>
						</ul>
						<p className={styles.sectionText}>
							{en
								? "Once a match kicks off, every room member's bet on it becomes visible below the score, sorted by points (highest first). Live points are calculated on the fly from the current score; final points are persisted after the match ends."
								: "Как только матч начался, ставки всех игроков комнаты на него отображаются под счётом, отсортированные по очкам (от наибольших). Очки во время матча рассчитываются на лету по текущему счёту; итоговые очки сохраняются после окончания."}
						</p>
					</section>

					{/* ───────── ROOM STATISTIC ───────── */}
					<section className={styles.section} id="room-statistic">
						<h2 className={styles.sectionTitle}>
							{en ? "Room statistic" : "Статистика комнаты"}
						</h2>
						<p className={styles.sectionText}>
							{en
								? "Four independent leaderboards covering every member of your active room:"
								: "Четыре независимые таблицы лидеров по всем участникам вашей текущей комнаты:"}
						</p>
						<ul className={styles.statList}>
							<li className={styles.statItem}>
								<strong>{t.stats.totalScore}</strong>
								{en
									? " — sum of all points plus playoff winner bonuses."
									: " — сумма всех очков плюс бонусы за угаданных победителей плей-офф."}
							</li>
							<li className={styles.statItem}>
								<strong>{t.stats.exactHits}</strong>
								{en
									? " — number of bets that scored exactly 3 points."
									: " — количество ставок, за которые начислено ровно 3 очка."}
							</li>
							<li className={styles.statItem}>
								<strong>{t.stats.predictedWins}</strong>
								{en
									? " — number of finished matches where the bet scored 1 point or more (any non-zero result)."
									: " — количество завершённых матчей, где ставка принесла 1 или больше очков (любой ненулевой результат)."}
							</li>
							<li className={styles.statItem}>
								<strong>{t.stats.avgPerMatch}</strong>
								{en ? (
									<>
										{" "}
										— {t.stats.totalScore} divided by the number of finished
										matches in the room. The denominator is the{" "}
										<strong>same for every player</strong>, so the ranking
										aligns with {t.stats.totalScore}.
									</>
								) : (
									<>
										{" "}
										— {t.stats.totalScore}, делённый на количество завершённых
										матчей в комнате. Знаменатель{" "}
										<strong>одинаков для всех</strong>, поэтому порядок
										совпадает с {t.stats.totalScore}.
									</>
								)}
							</li>
						</ul>
					</section>

					{/* ───────── PERSONAL STATISTIC ───────── */}
					<section className={styles.section} id="personal-statistic">
						<h2 className={styles.sectionTitle}>
							{en ? "Personal statistic" : "Личная статистика"}
						</h2>
						<p className={styles.sectionText}>
							{en
								? "Your personal stats for the active room: the same four metrics as the room leaderboard plus a few personal ones:"
								: "Ваша личная статистика по активной комнате: те же четыре метрики, что и в таблице комнаты, плюс несколько личных:"}
						</p>
						<ul className={styles.statList}>
							<li className={styles.statItem}>
								<strong>
									{en
										? "Favorite Score (Most Bets)"
										: "Любимый счёт (по ставкам)"}
								</strong>
								{en ? (
									<>
										{" "}
										— the score you predicted most often.{" "}
										<strong>Direction-neutral</strong>: 1:2 and 2:1 are counted
										as the same pattern.
									</>
								) : (
									<>
										{" "}
										— счёт, который вы предсказывали чаще всего.{" "}
										<strong>Нейтрален к направлению</strong>: 1:2 и 2:1
										считаются одним и тем же.
									</>
								)}
							</li>
							<li className={styles.statItem}>
								<strong>
									{en
										? "Favorite Score (Most Points)"
										: "Любимый счёт (по очкам)"}
								</strong>
								{en
									? " — the score pattern that earned you the most total points (also direction-neutral)."
									: " — счёт, по которому вы набрали больше всего очков суммарно (тоже нейтрален к направлению)."}
							</li>
							<li className={styles.statItem}>
								<strong>{en ? "Best Day" : "Лучший день"}</strong>
								{en
									? " — the calendar day with the highest sum of points across all your bets."
									: " — день с наибольшей суммой очков по всем вашим ставкам."}
							</li>
						</ul>
						<p className={styles.sectionText}>
							{en
								? "Below the stat cards you'll see the complete history of your bets, newest first, with the actual scoreboard result, your prediction, and the points it earned."
								: "Ниже карточек со статистикой — полная история ваших ставок (новейшие сверху), с реальным счётом, вашим прогнозом и заработанными очками."}
						</p>
					</section>

					{/* ───────── GLOBAL TOP ───────── */}
					<section className={styles.section} id="global-top">
						<h2 className={styles.sectionTitle}>
							{en ? "Global top" : "Общий рейтинг"}
						</h2>
						<p className={styles.sectionText}>
							{en
								? "A cross-room leaderboard visible to everyone. The same four metrics are shown — but each metric is calculated independently per room, and your best result across all your rooms is used."
								: "Рейтинг по всем комнатам, виден всем. Те же четыре метрики, но каждая считается независимо по каждой комнате, и берётся ваш лучший результат среди всех ваших комнат."}
						</p>
						<p className={styles.sectionText}>
							{en ? (
								<>
									Tables are <strong>not linked</strong> — your{" "}
									{t.stats.totalScore} may come from one room while your{" "}
									{t.stats.exactHits} come from another.
								</>
							) : (
								<>
									Таблицы <strong>не связаны</strong> между собой —{" "}
									{t.stats.totalScore} может быть из одной комнаты, а{" "}
									{t.stats.exactHits} — из другой.
								</>
							)}
						</p>
					</section>

					{/* ───────── WORLD CUP ───────── */}
					<section className={styles.section} id="world-cup">
						<h2 className={styles.sectionTitle}>FIFA World Cup 2026™</h2>
						<p className={styles.sectionText}>
							{en
								? "A tournament view: group standings for all 12 groups (A–L) plus the knockout bracket from the round of 32 to the final. Group standings are derived from finished matches; the bracket fills in as playoff matches are played."
								: "Вид турнира: групповые таблицы всех 12 групп (A–L) плюс сетка плей-офф от 1/16 финала до финала. Групповые таблицы строятся по завершённым матчам; сетка заполняется по мере проведения матчей плей-офф."}
						</p>
					</section>
				</div>

				<div className={styles.footer}>
					<p className={styles.footerText}>
						{en ? (
							<>
								Good luck! To launch a room for your friends, contact{" "}
								<Link className={styles.link} href="https://t.me/main_infomat">
									@main_infomat
								</Link>{" "}
								on Telegram.
							</>
						) : (
							<>
								Удачи! Чтобы запустить комнату для друзей, напишите{" "}
								<Link className={styles.link} href="https://t.me/main_infomat">
									@main_infomat
								</Link>{" "}
								в Telegram.
							</>
						)}
					</p>
					<Button href={PAGES.LOGIN} color="primary" size="lg">
						{en ? "Start playing →" : "Начать играть →"}
					</Button>
				</div>
			</div>
		</div>
	);
}
