import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const DraggableAccordionItem = ({ skill, isExpanded, onToggle }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging
    } = useSortable({ id: skill.title });
  
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 1000 : 1
    };
  
    return (
      <div
        ref={setNodeRef}
        className="mt-5 card w-100 shadow"
        style={style}
      >
        <div className="card-header bg-primary text-tertiary">
          <div className="d-flex justify-content-between align-items-center">
            <div 
              {...attributes} 
              {...listeners}
              className="me-3" 
              style={{ 
                cursor: 'grab',
                fontSize: '20px',
                userSelect: 'none'
              }}
            >
              ⠿
            </div>
  
            <h5 className="mb-0 flex-grow-1">{skill.title}</h5>
  
            <button
              onClick={() => onToggle(skill.title)}
              className="btn btn-link text-tertiary ms-3"
              style={{ 
                textDecoration: 'none',
                fontSize: '20px',
                padding: '0 10px',
                cursor: 'pointer'
              }}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          </div>
        </div>
  
        <div 
          className={`card-footer bg-tertiary ${isExpanded ? 'd-block' : 'd-none'}`}
        >
          <blockquote className="blockquote mb-0">
            <p>{skill.content}</p>
          </blockquote>
        </div>
      </div>
    );
  };
  
  const DraggableAccordionStack = () => {
    const [expandedCards, setExpandedCards] = useState(new Set());
    const [skillList, setSkillList] = useState([
      {
        title: 'What are the main programming languages, tools, and frameworks that you use in your work?',
        content: 'I am a .NET developer who uses C# as my primary programming language. I use the MVC pattern to create web applications that separate the presentation, business logic, and data access layers. I use SQL Server Management Studio (SSMS) as my database management tool, and SQL as my query language to interact with the data stored in the back end of my applications.'
      },
      {
        title: 'What are the main types of software applications or systems that you develop or maintain?',
        content: 'I develop and maintain in-house projects that offer affiliate marketing services to other businesses. Affiliate marketing is a type of online marketing where affiliates earn commissions for referring customers or leads to a business. My projects provide tools for tracking, reporting, analytics, lead generation, and more to help my clients improve their marketing strategies and results.'
      },
      {
        title: 'How do you collaborate with other developers, designers, testers, or stakeholders in your projects?',
        content: 'I use Jira as my project management tool to keep track of tasks, features, bugs, and progress. I follow the agile methodology to deliver software in short and iterative cycles. I have daily stand-up meetings with my team to share what I have done, what I plan to do, and what challenges I face. I also have weekly sizing meetings with my team and stakeholders to estimate the effort and complexity of future features, and prioritize them according to the client\'s needs and expectations.'
      },
      {
        title: 'What are some of the most challenging or interesting projects that you have worked on?',
        content: 'One of my most challenging projects was the partner sign-up project. The goal was to create a customizable sign-up page for each client that allows them to collect different information from their affiliates based on their requirements. Some of the challenges that I faced were handling a lot of variation and validation for each field, ensuring security and privacy of the data, and integrating with other systems or services.'
      },
      {
        title: 'How do you keep your skills and knowledge up to date?',
        content: 'I am always eager to learn new skills and technologies that are relevant to my work. Some of the sources or resources that I use for learning new technologies or best practices are online courses from Pluralsight, Podcasts, and videos from Youtube. Some of the topics or areas that I am interested in or curious about are AI, machine learning, cloud computing, etc.'
      }
    ]);
  
    // Initialize all cards as expanded
    useEffect(() => {
      setExpandedCards(new Set(skillList.map(skill => skill.title)));
    }, []);
  
    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: 8,
        },
      }),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    );
  
    const handleDragEnd = (event) => {
      const { active, over } = event;
      
      if (active.id !== over.id) {
        setSkillList((items) => {
          const oldIndex = items.findIndex((item) => item.title === active.id);
          const newIndex = items.findIndex((item) => item.title === over.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      }
    };
  
    const toggleCard = (cardId) => {
      setExpandedCards(prev => {
        const newExpanded = new Set(prev);
        if (newExpanded.has(cardId)) {
          newExpanded.delete(cardId);
        } else {
          newExpanded.add(cardId);
        }
        return newExpanded;
      });
    };
  
    return (
      <div className="container mt-5" style={{width: "100vw", minHeight: "100vh", overflow: "auto"}}>
        <h1 className="text-accent">Skills</h1>
        <div className="d-flex flex-column align-items-center">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={skillList.map(skill => skill.title)}
              strategy={verticalListSortingStrategy}
            >
              {skillList.map((skill) => (
                <DraggableAccordionItem
                  key={skill.title}
                  skill={skill}
                  isExpanded={expandedCards.has(skill.title)}
                  onToggle={toggleCard}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>
    );
  };

export default DraggableAccordionStack;