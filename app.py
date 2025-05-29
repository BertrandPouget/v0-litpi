import streamlit as st
import pandas as pd
from streamlit_gsheets import GSheetsConnection
from streamlit_option_menu import option_menu
from streamlit_image_select import image_select
from datetime import datetime
import warnings
warnings.filterwarnings("ignore")

# Set page configuration
st.set_page_config(
    page_title="Litpi", 
    page_icon="🏡",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Custom CSS for modern cream-themed design
st.markdown("""
<style>
    /* Import Google Fonts */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    /* Global Styles */
    .stApp {
        background: linear-gradient(135deg, #faf8f3 0%, #f5f1e8 100%);
        font-family: 'Inter', sans-serif;
    }
    
    /* Hide Streamlit branding */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    
    /* Main title styling */
    .main-title {
        text-align: center;
        color: #8b6f47;
        font-size: 3.5rem;
        font-weight: 700;
        margin-bottom: 2rem;
        text-shadow: 2px 2px 4px rgba(139, 111, 71, 0.1);
    }
    
    /* Character selection container */
    .character-container {
        background: rgba(255, 255, 255, 0.8);
        border-radius: 20px;
        padding: 2rem;
        margin: 2rem 0;
        box-shadow: 0 8px 32px rgba(139, 111, 71, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    /* Section headers */
    .section-header {
        color: #8b6f47;
        font-size: 2rem;
        font-weight: 600;
        margin: 2rem 0 1rem 0;
        padding-bottom: 0.5rem;
        border-bottom: 3px solid #d4c4a8;
    }
    
    /* Cards for content sections */
    .content-card {
        background: rgba(255, 255, 255, 0.9);
        border-radius: 15px;
        padding: 1.5rem;
        margin: 1rem 0;
        box-shadow: 0 4px 20px rgba(139, 111, 71, 0.08);
        border: 1px solid rgba(212, 196, 168, 0.3);
    }
    
    /* Ranking styles */
    .ranking-item {
        background: linear-gradient(135deg, #fff9f0 0%, #fdf5e6 100%);
        border-radius: 12px;
        padding: 1rem;
        margin: 0.5rem 0;
        border-left: 4px solid #d4c4a8;
        box-shadow: 0 2px 10px rgba(139, 111, 71, 0.05);
    }
    
    /* Metric styling */
    [data-testid="stMetricValue"] {
        font-size: 1.8rem;
        color: #8b6f47;
        font-weight: 600;
    }
    
    [data-testid="stMetricDelta"] {
        font-size: 1.2rem;
        font-weight: 500;
    }
    
    /* Button styling */
    .stButton > button {
        background: linear-gradient(135deg, #d4c4a8 0%, #c4b49a 100%);
        color: #5a4a3a;
        border: none;
        border-radius: 10px;
        padding: 0.75rem 2rem;
        font-weight: 600;
        font-size: 1rem;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(139, 111, 71, 0.2);
    }
    
    .stButton > button:hover {
        background: linear-gradient(135deg, #c4b49a 0%, #b4a48a 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(139, 111, 71, 0.3);
    }
    
    /* Input styling */
    .stTextInput > div > div > input,
    .stNumberInput > div > div > input {
        background: rgba(255, 255, 255, 0.9);
        border: 2px solid #e8dcc0;
        border-radius: 10px;
        padding: 0.75rem;
        font-size: 1rem;
        transition: all 0.3s ease;
    }
    
    .stTextInput > div > div > input:focus,
    .stNumberInput > div > div > input:focus {
        border-color: #d4c4a8;
        box-shadow: 0 0 0 3px rgba(212, 196, 168, 0.2);
    }
    
    /* Multiselect styling */
    .stMultiSelect > div > div {
        background: rgba(255, 255, 255, 0.9);
        border: 2px solid #e8dcc0;
        border-radius: 10px;
    }
    
    /* History item styling */
    .history-item {
        background: rgba(255, 255, 255, 0.7);
        border-radius: 8px;
        padding: 1rem;
        margin: 0.5rem 0;
        border-left: 3px solid #d4c4a8;
        transition: all 0.3s ease;
    }
    
    .history-item:hover {
        background: rgba(255, 255, 255, 0.9);
        transform: translateX(5px);
    }
    
    /* Shopping list styling */
    .shopping-item {
        background: linear-gradient(135deg, #fff9f0 0%, #fdf5e6 100%);
        border-radius: 8px;
        padding: 0.75rem 1rem;
        margin: 0.3rem 0;
        border-left: 3px solid #d4c4a8;
        font-size: 1.1rem;
        color: #5a4a3a;
    }
    
    /* Empty state styling */
    .empty-state {
        text-align: center;
        color: #8b6f47;
        font-style: italic;
        padding: 2rem;
        background: rgba(255, 255, 255, 0.5);
        border-radius: 10px;
        border: 2px dashed #d4c4a8;
    }
    
    /* Navigation menu customization */
    .nav-link-selected {
        background-color: #d4c4a8 !important;
    }
</style>
""", unsafe_allow_html=True)

# Establish connection to Google Sheets
conn = st.connection("gsheets", type=GSheetsConnection)

# Main title with custom styling
st.markdown('<h1 class="main-title">🏡 Litpi</h1>', unsafe_allow_html=True)

# Character selection with improved styling
st.markdown('<div class="character-container">', unsafe_allow_html=True)
st.markdown("### 👤 Seleziona il tuo personaggio")

fighters = ['Andrea', 'Marco', 'Martino']

fighter_img = image_select(
    label="",
    images=[
        "images/andrea.jpg",
        "images/marco.jpg", 
        "images/martino.jpg",
    ],
    captions=["Andrea", "Marco", "Martino"],
    use_container_width=False
)

if fighter_img == "images/andrea.jpg":
    fighter = "Andrea"
elif fighter_img == "images/marco.jpg":
    fighter = "Marco"
elif fighter_img == "images/martino.jpg":
    fighter = "Martino"

st.markdown('</div>', unsafe_allow_html=True)

# Navigation menu
selected = option_menu(
    menu_title=None,
    options=["Pulizie", "Spesa", 'Debiti'], 
    icons=['droplet-fill', "list-task", 'piggy-bank-fill'], 
    menu_icon="cast",
    default_index=0,
    orientation="horizontal",
    styles={
        "container": {"padding": "0!important", "background-color": "transparent"},
        "icon": {"color": "#8b6f47", "font-size": "18px"}, 
        "nav-link": {
            "font-size": "16px", 
            "text-align": "center", 
            "margin": "0px", 
            "--hover-color": "#f5f1e8",
            "background-color": "rgba(255, 255, 255, 0.8)",
            "color": "#8b6f47",
            "border-radius": "10px",
            "margin": "5px"
        },
        "nav-link-selected": {"background-color": "#d4c4a8", "color": "#5a4a3a"},
    }
)

# 1. Chores Section
if selected == 'Pulizie':
    df_chores_all = conn.read(worksheet="Chores", ttl=1)
    df_chores = df_chores_all[['Compito', 'Valore', 'Andrea', 'Marco', 'Martino']].head(15)
    df_chores_history = df_chores_all[['Persona', 'Quando', 'Cosa']]

    hist_rows = 10
    df_chores_history.dropna(axis=0, inplace=True)

    # Ranking section
    st.markdown('<div class="content-card">', unsafe_allow_html=True)
    st.markdown('<h2 class="section-header">🏆 Classifica</h2>', unsafe_allow_html=True)
    
    points = df_chores.copy()
    points[fighters] = points[fighters].multiply(df_chores['Valore'], axis=0)
    rank = points[fighters].sum().sort_values(ascending=False)

    prev_score = None
    rank_num = 0

    for person, score in rank.items():
        if score != prev_score:
            rank_num += 1
            prev_score = score

        if rank_num == 1:
            medal = "🥇"
        elif rank_num == 2:
            medal = "🥈"
        elif rank_num == 3:
            medal = "🥉"
        else:
            medal = "🏅"

        st.markdown(f'<div class="ranking-item">{medal} <strong>{person}</strong> - <em>{score:.0f} punti</em></div>', unsafe_allow_html=True)
    
    st.markdown('</div>', unsafe_allow_html=True)

    # Update section
    st.markdown('<div class="content-card">', unsafe_allow_html=True)
    st.markdown('<h2 class="section-header">✅ Aggiornamento</h2>', unsafe_allow_html=True)
    
    chores = st.multiselect(
        label="Seleziona i compiti che hai fatto",
        options=df_chores.loc[:, "Compito"].tolist(),
        default=None
    )

    if st.button("🔄 Conferma", key="confirm_chores"):
        with st.spinner(f"Aggiornamento dei lavori di {fighter} in corso..."):
            new_df_chores = df_chores.copy(deep=True)
            for chore in chores:
                new_df_chores.loc[new_df_chores['Compito'] == chore, fighter] += 1

            new_df_chores_history = df_chores_history.copy(deep=True)
            new_df_chores_history = pd.concat([
                pd.DataFrame([[fighter, datetime.now().strftime("%d/%m/%Y, %H:%M"), ', '.join(chores)]], 
                           columns=new_df_chores_history.columns), 
                new_df_chores_history
            ], ignore_index=True)

            new_df_chores_all = pd.concat([new_df_chores, pd.DataFrame([[""]], columns=[""]), new_df_chores_history], axis=1)
            conn.update(worksheet="Chores", data=new_df_chores_all)
            st.success("✅ Aggiornamento completato!")
            st.rerun()
    
    st.markdown('</div>', unsafe_allow_html=True)

    # History section
    st.markdown('<div class="content-card">', unsafe_allow_html=True)
    st.markdown('<h2 class="section-header">📋 Storico</h2>', unsafe_allow_html=True)

    people = df_chores_history['Persona'].tolist()
    days = df_chores_history['Quando'].tolist()
    actions = df_chores_history['Cosa'].tolist()
    
    for (i, person, day, action) in zip(range(hist_rows), people, days, actions):
        st.markdown(f'''
        <div class="history-item">
            📅 {day}<br>
            <strong>{person}</strong> si è segnato <strong>{action}</strong>
        </div>
        ''', unsafe_allow_html=True)
    
    st.markdown('</div>', unsafe_allow_html=True)

    # Complete table section
    st.markdown('<div class="content-card">', unsafe_allow_html=True)
    st.markdown('<h2 class="section-header">📊 Tabella Completa</h2>', unsafe_allow_html=True)
    
    df_chores_style = df_chores.style \
        .applymap(lambda x: 'background-color: #fdf1d6', subset=df_chores.columns[0:2]) \
        .format(precision=0, thousands="'", decimal=".")
    st.dataframe(df_chores_style, use_container_width=True)
    st.markdown('</div>', unsafe_allow_html=True)

# 2. Shopping List Section
elif selected == 'Spesa':
    df_shopping = conn.read(worksheet="Shopping", usecols=list(range(0,1)), ttl=1)
    shopping_list = df_shopping['Spesa'].dropna().tolist()
    
    # Shopping list display
    st.markdown('<div class="content-card">', unsafe_allow_html=True)
    st.markdown('<h2 class="section-header">🛒 Lista della Spesa</h2>', unsafe_allow_html=True)
    
    if shopping_list == []:
        st.markdown('<div class="empty-state">🛍️ La lista della spesa è vuota</div>', unsafe_allow_html=True)
    else:
        for i, item in enumerate(shopping_list):
            st.markdown(f'<div class="shopping-item">{i+1}. {item}</div>', unsafe_allow_html=True)
    
    st.markdown('</div>', unsafe_allow_html=True)

    # Add items section
    st.markdown('<div class="content-card">', unsafe_allow_html=True)
    st.markdown('<h2 class="section-header">➕ Aggiungi Elemento</h2>', unsafe_allow_html=True)
    
    col1, col2 = st.columns([3, 1])
    with col1:
        user_input = st.text_input("Nuovo elemento:", placeholder="Inserisci un nuovo elemento...")
    with col2:
        st.markdown("<br>", unsafe_allow_html=True)
        if st.button("➕ Aggiungi", key="add_item"):
            if user_input:
                with st.spinner("Aggiunta elemento..."):
                    new_df_shopping = df_shopping.copy(deep=True)
                    new_df_shopping = pd.concat([pd.DataFrame({'Spesa': [user_input]}), df_shopping], ignore_index=True)
                    conn.update(worksheet="Shopping", data=new_df_shopping)
                    st.success("✅ Elemento aggiunto!")
                    st.rerun()
    
    st.markdown('</div>', unsafe_allow_html=True)

    # Remove items section
    if shopping_list:
        st.markdown('<div class="content-card">', unsafe_allow_html=True)
        st.markdown('<h2 class="section-header">🗑️ Rimuovi Elementi</h2>', unsafe_allow_html=True)
        
        elements_to_delete = st.multiselect(
            label="Seleziona gli elementi da eliminare",
            options=shopping_list,
            default=None
        )
        
        col1, col2 = st.columns(2)
        with col1:
            if st.button("🗑️ Elimina Selezionati", key="delete_selected"):
                if elements_to_delete:
                    with st.spinner("Eliminazione elementi..."):
                        new_df_shopping = df_shopping.copy(deep=True)
                        for element in elements_to_delete:
                            new_df_shopping.loc[new_df_shopping['Spesa'] == element, 'Spesa'] = None
                        conn.update(worksheet="Shopping", data=new_df_shopping)
                        st.success("✅ Elementi eliminati!")
                        st.rerun()
        
        with col2:
            if st.button("🧹 Svuota Lista", key="clear_list"):
                with st.spinner("Svuotamento lista..."):
                    new_df_shopping = df_shopping.copy(deep=True)
                    for element in shopping_list:
                        new_df_shopping.loc[new_df_shopping['Spesa'] == element, 'Spesa'] = None
                    conn.update(worksheet="Shopping", data=new_df_shopping)
                    st.success("✅ Lista svuotata!")
                    st.rerun()
        
        st.markdown('</div>', unsafe_allow_html=True)

# 3. Debts and Credits Section
elif selected == 'Debiti':
    df_debts_all = conn.read(worksheet="Debts", ttl=1)
    df_debts = df_debts_all.iloc[0:3, 0:2]
    df_debts_history = df_debts_all[['Creditore', 'Soldi', 'Debitori', 'Data', 'Causale']]

    hist_rows = 10
    df_debts_history.dropna(axis=0, subset=["Creditore"], inplace=True)
    debts = df_debts['Bilancio'].tolist()

    # Balance display
    st.markdown('<div class="content-card">', unsafe_allow_html=True)
    st.markdown('<h2 class="section-header">💰 Saldi</h2>', unsafe_allow_html=True)
    
    cols = st.columns(3)
    for i, (person, debt) in enumerate(zip(fighters, debts)):
        with cols[i]:
            delta_color = "normal" if debt >= 0 else "inverse"
            st.metric(
                label=f"💳 {person}", 
                value=f"{debt:.2f}€",
                delta=f"{abs(debt):.2f}€" if debt != 0 else "0.00€",
                delta_color=delta_color
            )
    
    st.markdown('</div>', unsafe_allow_html=True)

    # Update debts section
    st.markdown('<div class="content-card">', unsafe_allow_html=True)
    st.markdown('<h2 class="section-header">💸 Nuovo Pagamento</h2>', unsafe_allow_html=True)
    
    col1, col2 = st.columns(2)
    with col1:
        credit = st.number_input(label="💵 Quanto hai pagato?", step=1.00, min_value=0.01)
        reason = st.text_input(label="📝 Causale", placeholder="Descrivi il pagamento...")
    
    with col2:
        debtors = st.multiselect(
            label="👥 Per chi hai pagato?",
            options=fighters,
            default=None
        )

    if st.button("💾 Aggiorna Debiti", key="update_debts"):
        if debtors and credit > 0 and reason:
            with st.spinner(f"Aggiornamento dei crediti di {fighter} in corso..."):
                debit = -credit / len(debtors)
                new_df_debts = df_debts.copy(deep=True)
                new_df_debts.loc[new_df_debts['Persona'] == fighter, 'Bilancio'] += credit
                for debtor in debtors:
                    new_df_debts.loc[new_df_debts['Persona'] == debtor, 'Bilancio'] += debit

                new_df_debts_history = df_debts_history.copy(deep=True)
                new_df_debts_history = pd.concat([
                    pd.DataFrame([[fighter, credit, ', '.join(debtors), datetime.now().strftime("%d/%m/%Y, %H:%M"), reason]], 
                               columns=new_df_debts_history.columns), 
                    new_df_debts_history
                ], ignore_index=True)
                
                new_df_debts_all = pd.concat([new_df_debts, pd.DataFrame([[""]], columns=[""]), new_df_debts_history], axis=1)
                conn.update(worksheet="Debts", data=new_df_debts_all)
                st.success("✅ Debiti aggiornati!")
                st.rerun()
        else:
            st.error("⚠️ Compila tutti i campi per procedere!")
    
    st.markdown('</div>', unsafe_allow_html=True)

    # Transaction history
    st.markdown('<div class="content-card">', unsafe_allow_html=True)
    st.markdown('<h2 class="section-header">📈 Storico Transazioni</h2>', unsafe_allow_html=True)

    creditors = df_debts_history['Creditore'].tolist()
    transactions = df_debts_history['Soldi'].tolist()
    debtors_list = df_debts_history['Debitori'].tolist()
    days = df_debts_history['Data'].tolist()
    reasons = df_debts_history['Causale'].tolist()
    
    for (i, creditor, transaction, debtor, day, reason) in zip(range(hist_rows), creditors, transactions, debtors_list, days, reasons):
        if debtor.find("Andrea") != -1 and debtor.find("Marco") != -1 and debtor.find("Martino") != -1: 
            debtor = "Tutti"
        
        st.markdown(f'''
        <div class="history-item">
            📅 <strong>{day}</strong> - 💰 <strong>{transaction:.2f}€</strong><br>
            📝 <em>{reason}</em><br>
            Pagato da <span style="color:#2e7d32; font-weight:600;">{creditor}</span> per <span style="color:#d32f2f; font-weight:600;">{debtor}</span>
        </div>
        ''', unsafe_allow_html=True)
    
    st.markdown('</div>', unsafe_allow_html=True)

# Footer
st.markdown("""
<div style="text-align: center; padding: 2rem; color: #8b6f47; font-style: italic;">
    Made with ❤️ for the Litpi household
</div>
""", unsafe_allow_html=True)
